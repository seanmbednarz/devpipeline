import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Whether Supabase is configured. When false, the app runs in read-only mode
 * against the static data only — no photos, no editing, no sign-in.
 */
export const supabaseEnabled = Boolean(url && anonKey)

export const supabase = supabaseEnabled ? createClient(url!, anonKey!) : null

export const PHOTO_BUCKET = 'pipeline-photos'
