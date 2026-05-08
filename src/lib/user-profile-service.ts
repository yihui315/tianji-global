import { z } from 'zod';
import type { PlatformContext } from '@/lib/unified-platform';
import { mapUserProfileRow } from '@/lib/unified-platform';
import type { UserProfile } from '@/types/user-profile';

export const createUserProfileSchema = z.object({
  profileType: z.enum(['self', 'other']).default('self'),
  displayName: z.string().trim().optional(),
  nickname: z.string().trim().optional(),
  birthDate: z.string().min(1, 'birthDate is required'),
  birthTime: z.string().trim().optional(),
  birthLocation: z.string().trim().optional(),
  timezone: z.string().trim().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  language: z.enum(['en', 'zh']).default('en'),
  gender: z.string().trim().optional(),
  isPrimary: z.boolean().optional(),
});

export const updateUserProfileSchema = createUserProfileSchema.partial().extend({
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

function toNullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

async function hasPrimaryProfile(context: PlatformContext): Promise<boolean> {
  const { data } = await context.supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', context.user.id)
    .eq('is_primary', true)
    .maybeSingle();

  return Boolean(data?.id);
}

async function unsetPrimaryProfile(context: PlatformContext): Promise<void> {
  await context.supabase
    .from('user_profiles')
    .update({ is_primary: false })
    .eq('user_id', context.user.id)
    .eq('is_primary', true);
}

export async function listUserProfiles(context: PlatformContext): Promise<UserProfile[]> {
  const { data, error } = await context.supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', context.user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapUserProfileRow);
}

export async function getUserProfile(context: PlatformContext, profileId: string): Promise<UserProfile | null> {
  const { data, error } = await context.supabase
    .from('user_profiles')
    .select('*')
    .eq('id', profileId)
    .eq('user_id', context.user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapUserProfileRow(data) : null;
}

export async function createUserProfile(
  context: PlatformContext,
  input: CreateUserProfileInput
): Promise<UserProfile> {
  const isPrimary = input.isPrimary ?? !(await hasPrimaryProfile(context));

  if (isPrimary) {
    await unsetPrimaryProfile(context);
  }

  const { data, error } = await context.supabase
    .from('user_profiles')
    .insert({
      user_id: context.user.id,
      profile_type: input.profileType,
      display_name: toNullable(input.displayName),
      nickname: toNullable(input.nickname),
      birth_date: input.birthDate,
      birth_time: toNullable(input.birthTime),
      birth_location: toNullable(input.birthLocation),
      timezone: toNullable(input.timezone) ?? context.user.timezone ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      language: input.language,
      gender: toNullable(input.gender),
      is_primary: isPrimary,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Unable to create user profile.');
  }

  return mapUserProfileRow(data);
}

export async function updateUserProfile(
  context: PlatformContext,
  profileId: string,
  input: UpdateUserProfileInput
): Promise<UserProfile | null> {
  const { data: existing, error: existingError } = await context.supabase
    .from('user_profiles')
    .select('*')
    .eq('id', profileId)
    .eq('user_id', context.user.id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existing) {
    return null;
  }

  if (input.isPrimary) {
    await unsetPrimaryProfile(context);
  }

  const { data, error } = await context.supabase
    .from('user_profiles')
    .update({
      profile_type: input.profileType ?? existing.profile_type,
      display_name: input.displayName === undefined ? existing.display_name : toNullable(input.displayName),
      nickname: input.nickname === undefined ? existing.nickname : toNullable(input.nickname),
      birth_date: input.birthDate ?? existing.birth_date,
      birth_time: input.birthTime === undefined ? existing.birth_time : toNullable(input.birthTime),
      birth_location:
        input.birthLocation === undefined ? existing.birth_location : toNullable(input.birthLocation),
      timezone: input.timezone === undefined ? existing.timezone : toNullable(input.timezone),
      lat: input.lat === undefined ? existing.lat : input.lat,
      lng: input.lng === undefined ? existing.lng : input.lng,
      language: input.language ?? existing.language,
      gender: input.gender === undefined ? existing.gender : toNullable(input.gender),
      is_primary: input.isPrimary ?? existing.is_primary,
    })
    .eq('id', profileId)
    .eq('user_id', context.user.id)
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Unable to update user profile.');
  }

  return mapUserProfileRow(data);
}

export async function setPrimaryUserProfile(
  context: PlatformContext,
  profileId: string
): Promise<UserProfile | null> {
  const existing = await getUserProfile(context, profileId);
  if (!existing) {
    return null;
  }

  await unsetPrimaryProfile(context);

  const { data, error } = await context.supabase
    .from('user_profiles')
    .update({ is_primary: true })
    .eq('id', profileId)
    .eq('user_id', context.user.id)
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Unable to set primary user profile.');
  }

  return mapUserProfileRow(data);
}

export async function deleteUserProfile(context: PlatformContext, profileId: string): Promise<'deleted' | 'not-found' | 'primary'> {
  const existing = await getUserProfile(context, profileId);
  if (!existing) {
    return 'not-found';
  }

  if (existing.isPrimary) {
    return 'primary';
  }

  const { error } = await context.supabase
    .from('user_profiles')
    .delete()
    .eq('id', profileId)
    .eq('user_id', context.user.id);

  if (error) {
    throw error;
  }

  return 'deleted';
}
