import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetPlatformContext = vi.fn();

vi.mock('@/lib/unified-platform', () => ({
  getPlatformContext: mockGetPlatformContext,
  mapUserProfileRow: (row: Record<string, unknown>) => ({
    id: row.id ?? '',
    userId: row.user_id ?? '',
    profileType: row.profile_type ?? 'self',
    displayName: row.display_name ?? undefined,
    nickname: row.nickname ?? undefined,
    birthDate: row.birth_date ?? '',
    birthTime: row.birth_time ?? undefined,
    birthLocation: row.birth_location ?? undefined,
    timezone: row.timezone ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    language: row.language ?? 'en',
    gender: row.gender ?? undefined,
    isPrimary: Boolean(row.is_primary),
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }),
}));

type Row = Record<string, unknown>;

function jsonRequest(url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method: body ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function createSupabase(seed: Row[] = []) {
  const rows = seed.map((row) => ({ ...row }));

  class Query {
    private filters: Array<[string, unknown]> = [];
    private orders: Array<{ column: string; ascending: boolean }> = [];
    private limitCount: number | null = null;
    private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
    private payload: Row | null = null;

    select() {
      return this;
    }

    eq(column: string, value: unknown) {
      this.filters.push([column, value]);
      return this;
    }

    order(column: string, options: { ascending: boolean }) {
      this.orders.push({ column, ascending: options.ascending });
      return this;
    }

    limit(count: number) {
      this.limitCount = count;
      return this;
    }

    insert(payload: Row) {
      this.action = 'insert';
      this.payload = payload;
      return this;
    }

    update(payload: Row) {
      this.action = 'update';
      this.payload = payload;
      return this;
    }

    delete() {
      this.action = 'delete';
      return this;
    }

    async maybeSingle() {
      const result = await this.execute();
      return { data: Array.isArray(result.data) ? result.data[0] ?? null : result.data, error: result.error };
    }

    async single() {
      const result = await this.execute();
      return { data: Array.isArray(result.data) ? result.data[0] ?? null : result.data, error: result.error };
    }

    then(resolve: (value: { data: Row[] | null; error: null }) => void, reject: (reason?: unknown) => void) {
      return this.execute().then(resolve, reject);
    }

    private matches(row: Row) {
      return this.filters.every(([column, value]) => row[column] === value);
    }

    private async execute(): Promise<{ data: Row[] | null; error: null }> {
      if (this.action === 'insert') {
        const row = {
          id: `profile-${rows.length + 1}`,
          created_at: '2026-05-08T00:00:00.000Z',
          updated_at: '2026-05-08T00:00:00.000Z',
          ...this.payload,
        };
        rows.push(row);
        return { data: [row], error: null };
      }

      let matched = rows.filter((row) => this.matches(row));

      if (this.action === 'update') {
        matched = matched.map((row) => {
          Object.assign(row, this.payload);
          return row;
        });
      }

      if (this.action === 'delete') {
        for (const row of matched) {
          rows.splice(rows.indexOf(row), 1);
        }
        return { data: null, error: null };
      }

      for (const order of [...this.orders].reverse()) {
        matched.sort((left, right) => {
          const leftValue = String(left[order.column] ?? '');
          const rightValue = String(right[order.column] ?? '');
          const comparison = leftValue.localeCompare(rightValue);
          return order.ascending ? comparison : -comparison;
        });
      }

      if (this.limitCount !== null) {
        matched = matched.slice(0, this.limitCount);
      }

      return { data: matched, error: null };
    }
  }

  return {
    rows,
    client: {
      from(table: string) {
        if (table !== 'user_profiles') {
          throw new Error(`Unexpected table: ${table}`);
        }
        return new Query();
      },
    },
  };
}

function setContext(supabase: ReturnType<typeof createSupabase>) {
  mockGetPlatformContext.mockResolvedValue({
    sessionUserId: 'session-user-a',
    sessionUserEmail: 'a@example.com',
    user: { id: 'user-a', email: 'a@example.com', timezone: 'UTC' },
    supabase: supabase.client,
  });
}

describe('User Platform Core API', () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetPlatformContext.mockReset();
  });

  it('returns 401 when no platform context is available', async () => {
    mockGetPlatformContext.mockResolvedValue(null);
    const { GET } = await import('@/app/api/user-profiles/route');

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('supports GET, POST, PATCH, GET by id, and DELETE on own user_profiles rows', async () => {
    const supabase = createSupabase([
      {
        id: 'profile-existing',
        user_id: 'user-a',
        profile_type: 'self',
        display_name: 'Existing',
        birth_date: '1990-01-01',
        language: 'en',
        is_primary: true,
      },
    ]);
    setContext(supabase);

    const collection = await import('@/app/api/user-profiles/route');
    const member = await import('@/app/api/user-profiles/[id]/route');

    const listResponse = await collection.GET();
    expect((await listResponse.json()).data).toHaveLength(1);

    const createResponse = await collection.POST(
      jsonRequest('http://localhost/api/user-profiles', {
        profileType: 'other',
        displayName: 'Partner',
        birthDate: '1992-02-02',
        birthTime: '09:30',
        birthLocation: 'Singapore',
        language: 'en',
      }) as never
    );
    const created = await createResponse.json();
    expect(createResponse.status).toBe(200);
    expect(created.data).toMatchObject({
      userId: 'user-a',
      displayName: 'Partner',
      birthDate: '1992-02-02',
      isPrimary: false,
    });

    const patchResponse = await member.PATCH(
      jsonRequest(`http://localhost/api/user-profiles/${created.data.id}`, {
        displayName: 'Partner Updated',
      }) as never,
      { params: Promise.resolve({ id: created.data.id }) }
    );
    expect((await patchResponse.json()).data.displayName).toBe('Partner Updated');

    const getResponse = await member.GET(
      jsonRequest(`http://localhost/api/user-profiles/${created.data.id}`) as never,
      { params: Promise.resolve({ id: created.data.id }) }
    );
    expect((await getResponse.json()).data.displayName).toBe('Partner Updated');

    const deleteResponse = await member.DELETE(
      jsonRequest(`http://localhost/api/user-profiles/${created.data.id}`) as never,
      { params: Promise.resolve({ id: created.data.id }) }
    );
    expect(deleteResponse.status).toBe(200);
    expect(supabase.rows.some((row) => row.id === created.data.id)).toBe(false);
  });

  it('sets a primary profile without exposing cross-user rows', async () => {
    const supabase = createSupabase([
      {
        id: 'profile-a1',
        user_id: 'user-a',
        profile_type: 'self',
        display_name: 'Primary',
        birth_date: '1990-01-01',
        language: 'en',
        is_primary: true,
      },
      {
        id: 'profile-a2',
        user_id: 'user-a',
        profile_type: 'other',
        display_name: 'Partner',
        birth_date: '1992-02-02',
        language: 'en',
        is_primary: false,
      },
      {
        id: 'profile-b1',
        user_id: 'user-b',
        profile_type: 'self',
        display_name: 'Other user',
        birth_date: '1993-03-03',
        language: 'en',
        is_primary: true,
      },
    ]);
    setContext(supabase);

    const setPrimary = await import('@/app/api/user-profiles/[id]/set-primary/route');
    const member = await import('@/app/api/user-profiles/[id]/route');

    const setPrimaryResponse = await setPrimary.POST(
      jsonRequest('http://localhost/api/user-profiles/profile-a2/set-primary') as never,
      { params: Promise.resolve({ id: 'profile-a2' }) }
    );
    const setPrimaryBody = await setPrimaryResponse.json();

    expect(setPrimaryResponse.status).toBe(200);
    expect(setPrimaryBody.data).toMatchObject({ id: 'profile-a2', isPrimary: true });
    expect(supabase.rows.find((row) => row.id === 'profile-a1')?.is_primary).toBe(false);
    expect(supabase.rows.find((row) => row.id === 'profile-a2')?.is_primary).toBe(true);

    const crossUserResponse = await member.GET(
      jsonRequest('http://localhost/api/user-profiles/profile-b1') as never,
      { params: Promise.resolve({ id: 'profile-b1' }) }
    );
    expect(crossUserResponse.status).toBe(404);
  });
});
