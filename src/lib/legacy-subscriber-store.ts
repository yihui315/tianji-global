import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const DEFAULT_SUBSCRIBERS_FILE = '/var/www/tianji-global/data/subscribers.json';

export interface LegacySubscriber {
  email: string;
  name?: string;
  subscribedAt: string;
  source: string;
}

export interface AddLegacySubscriberInput {
  email: string;
  name?: string;
  source: string;
}

let mutationQueue: Promise<void> = Promise.resolve();

function getSubscribersFile(): string {
  return process.env.SUBSCRIBERS_FILE?.trim() || DEFAULT_SUBSCRIBERS_FILE;
}

function isLegacySubscriber(value: unknown): value is LegacySubscriber {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<LegacySubscriber>;
  return (
    typeof candidate.email === 'string' &&
    candidate.email.length > 0 &&
    (candidate.name === undefined || typeof candidate.name === 'string') &&
    typeof candidate.subscribedAt === 'string' &&
    typeof candidate.source === 'string' &&
    candidate.source.length > 0
  );
}

export async function readLegacySubscribers(): Promise<LegacySubscriber[]> {
  const file = getSubscribersFile();

  let raw: string;
  try {
    raw = await readFile(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isLegacySubscriber)) {
    throw new Error('Legacy subscriber store has an invalid schema');
  }

  return parsed;
}

async function writeLegacySubscribers(subscribers: LegacySubscriber[]): Promise<void> {
  const file = getSubscribersFile();
  const directory = dirname(file);
  const temporaryFile = `${file}.${process.pid}.${Date.now()}.tmp`;

  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(temporaryFile, `${JSON.stringify(subscribers, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
  await rename(temporaryFile, file);
}

export function addLegacySubscriber(
  input: AddLegacySubscriberInput,
): Promise<{ created: boolean }> {
  const operation = mutationQueue.then(async () => {
    const subscribers = await readLegacySubscribers();
    const normalizedEmail = input.email.trim().toLowerCase();
    const exists = subscribers.some(
      (subscriber) => subscriber.email.trim().toLowerCase() === normalizedEmail,
    );

    if (exists) return { created: false };

    subscribers.push({
      email: normalizedEmail,
      name: input.name,
      subscribedAt: new Date().toISOString(),
      source: input.source,
    });

    await writeLegacySubscribers(subscribers);
    return { created: true };
  });

  mutationQueue = operation.then(
    () => undefined,
    () => undefined,
  );

  return operation;
}

export async function countLegacySubscribers(): Promise<number> {
  return (await readLegacySubscribers()).length;
}
