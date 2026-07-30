import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  addLegacySubscriber,
  countLegacySubscribers,
  readLegacySubscribers,
} from '@/lib/legacy-subscriber-store';

const temporaryDirectories: string[] = [];

async function createStorePath() {
  const directory = await mkdtemp(join(tmpdir(), 'tianji-subscribers-'));
  temporaryDirectories.push(directory);
  const file = join(directory, 'nested', 'subscribers.json');
  vi.stubEnv('SUBSCRIBERS_FILE', file);
  return file;
}

afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe('legacy subscriber store', () => {
  it('creates the store atomically and normalizes duplicate emails', async () => {
    const file = await createStorePath();

    await expect(addLegacySubscriber({
      email: 'Reader@Example.com',
      name: 'Reader',
      source: 'homepage',
    })).resolves.toEqual({ created: true });

    await expect(addLegacySubscriber({
      email: ' reader@example.com ',
      source: 'footer',
    })).resolves.toEqual({ created: false });

    await expect(countLegacySubscribers()).resolves.toBe(1);
    await expect(readLegacySubscribers()).resolves.toEqual([
      expect.objectContaining({
        email: 'reader@example.com',
        name: 'Reader',
        source: 'homepage',
      }),
    ]);

    const persisted = JSON.parse(await readFile(file, 'utf8'));
    expect(persisted).toHaveLength(1);
  });

  it('returns zero when the legacy file does not exist', async () => {
    await createStorePath();
    await expect(countLegacySubscribers()).resolves.toBe(0);
  });

  it('refuses to overwrite a corrupt subscriber file', async () => {
    const file = await createStorePath();
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, '{not-json', 'utf8');

    await expect(addLegacySubscriber({
      email: 'reader@example.com',
      source: 'homepage',
    })).rejects.toThrow();

    await expect(readFile(file, 'utf8')).resolves.toBe('{not-json');
  });
});
