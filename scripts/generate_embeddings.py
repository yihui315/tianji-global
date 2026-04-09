#!/usr/bin/env python3
"""
Generate embeddings for existing readings in TianJi Global.
Stores results in PostgreSQL reading_embeddings table.

Usage:
    python scripts/generate_embeddings.py --service-type bazi --batch-size 50
    python scripts/generate_embeddings.py --dry-run --service-type yijing

Requires:
    pip install openai psycopg2-binary python-dotenv
"""

import argparse
import json
import os
import sys
from dataclasses import dataclass
from typing import Optional

try:
    import openai
except ImportError:
    print("ERROR: openai not installed. Run: pip install openai")
    sys.exit(1)

try:
    import psycopg2
    from psycopg2.extras import Json
except ImportError:
    print("ERROR: psycopg2-binary not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    database_url: str
    openai_api_key: str
    service_type: Optional[str] = None
    batch_size: int = 50
    dry_run: bool = False


def parse_args() -> Config:
    parser = argparse.ArgumentParser(description="Generate embeddings for TianJi Global readings")
    parser.add_argument(
        "--service-type",
        choices=["yijing", "tarot", "bazi", "ziwei", "western", "fortune"],
        help="Filter by service type",
    )
    parser.add_argument("--batch-size", type=int, default=50, help="Batch size for embedding generation")
    parser.add_argument("--dry-run", action="store_true", help="Don't write to database, just print")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of records to process")
    args = parser.parse_args()

    database_url = os.getenv("DATABASE_URL")
    openai_api_key = os.getenv("OPENAI_API_KEY")

    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        sys.exit(1)

    if not openai_api_key:
        print("ERROR: OPENAI_API_KEY environment variable not set")
        sys.exit(1)

    return Config(
        database_url=database_url,
        openai_api_key=openai_api_key,
        service_type=args.service_type,
        batch_size=args.batch_size,
        dry_run=args.dry_run,
    )


def get_openai_client(api_key: str):
    return openai.OpenAI(api_key=api_key)


def generate_embedding(client: openai.OpenAI, text: str, model: str = "text-embedding-3-small") -> list:
    """Generate embedding using OpenAI API."""
    response = client.embeddings.create(input=text, model=model)
    return response.data[0].embedding


def get_readings_without_embeddings(conn, service_type: Optional[str], limit: Optional[int]):
    """Fetch readings that don't have embeddings yet."""
    query = """
        SELECT r.id, r.service_type, r.result_data::text as content
        FROM readings r
        LEFT JOIN reading_embeddings re ON r.id = re.reading_id
        WHERE re.id IS NULL
    """
    params = []

    if service_type:
        query += " AND r.service_type = %s"
        params.append(service_type)

    if limit:
        query += " LIMIT %s"
        params.append(limit)

    query += " ORDER BY r.created_at DESC"

    with conn.cursor() as cur:
        cur.execute(query, params)
        return cur.fetchall()


def store_embedding(conn, reading_id: str, service_type: str, content: str, embedding: list):
    """Store embedding in PostgreSQL."""
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO reading_embeddings (id, reading_id, service_type, content_text, embedding, created_at)
            VALUES (gen_random_uuid(), %s, %s, %s, %s::vector, NOW())
            ON CONFLICT (reading_id) DO UPDATE SET
                content_text = EXCLUDED.content_text,
                embedding = EXCLUDED.embedding
            """,
            [reading_id, service_type, content[:10000], Json(embedding)],
        )


def main():
    config = parse_args()

    # Connect to database
    try:
        conn = psycopg2.connect(config.database_url)
    except Exception as e:
        print(f"ERROR: Could not connect to database: {e}")
        sys.exit(1)

    # Test pgvector extension
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM pg_extension WHERE extname = 'vector'")
        if cur.fetchone() is None:
            print("WARNING: pgvector extension not installed. Run: CREATE EXTENSION vector;")
            print("Embeddings will use JSON storage instead of vector type.")

    client = get_openai_client(config.openai_api_key)

    print(f"Fetching readings without embeddings...")
    if config.service_type:
        print(f"  Service type: {config.service_type}")
    print(f"  Batch size: {config.batch_size}")
    print(f"  Dry run: {config.dry_run}")

    readings = get_readings_without_embeddings(conn, config.service_type, config.limit)
    print(f"Found {len(readings)} readings to process")

    if not readings:
        print("Nothing to do.")
        conn.close()
        return

    success = 0
    failed = 0
    errors = []

    for i, (reading_id, service_type, content) in enumerate(readings):
        try:
            if config.dry_run:
                print(f"[DRY RUN] Would embed reading {reading_id} ({service_type})")
                success += 1
                continue

            # Truncate very long content
            truncated = content[:8000] if content else ""

            print(f"[{i+1}/{len(readings)}] Generating embedding for {reading_id}...", end=" ", flush=True)
            embedding = generate_embedding(client, truncated)
            store_embedding(conn, reading_id, service_type, truncated, embedding)
            conn.commit()
            print("OK")
            success += 1

        except Exception as e:
            print(f"FAILED: {e}")
            failed += 1
            errors.append(f"{reading_id}: {e}")
            conn.rollback()

    conn.close()

    print(f"\n=== Results ===")
    print(f"  Success: {success}")
    print(f"  Failed: {failed}")
    if errors:
        print(f"  Errors:")
        for err in errors[:10]:
            print(f"    {err}")
        if len(errors) > 10:
            print(f"    ... and {len(errors) - 10} more")


if __name__ == "__main__":
    main()
