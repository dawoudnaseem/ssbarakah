import { supabase } from './supabaseClient'
import type { Teammate } from '@/types/database'

const TEAMMATE_KEY = 'ss_barakah_teammate'
const ADMIN_KEY = 'ss_barakah_admin'
const ADMIN_CODE = 'Dawoud Sink'

export async function loginTeammate(name: string, password: string): Promise<Teammate | null> {
  const { data, error } = await supabase
    .from('teammates')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  // MVP: plain text comparison — replace with bcrypt hash comparison before production
  const match = data.plain_password === password || data.password_hash === password
  if (!match) return null

  sessionStorage.setItem(TEAMMATE_KEY, JSON.stringify(data))
  return data as Teammate
}

export function logoutTeammate(): void {
  sessionStorage.removeItem(TEAMMATE_KEY)
}

export function getCurrentTeammate(): Teammate | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(TEAMMATE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Teammate
  } catch {
    return null
  }
}

export function validateAdminCode(code: string): boolean {
  return code.trim() === ADMIN_CODE
}

export function setAdminSession(): void {
  sessionStorage.setItem(ADMIN_KEY, 'true')
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(ADMIN_KEY) === 'true'
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_KEY)
}

export async function changeTeammatePassword(teammateId: string, newPassword: string): Promise<boolean> {
  const { error } = await supabase
    .from('teammates')
    .update({ plain_password: newPassword, updated_at: new Date().toISOString() })
    .eq('id', teammateId)
  return !error
}
