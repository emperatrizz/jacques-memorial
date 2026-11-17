export async function api<T = unknown>(
  path: string,
  opts?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(path, {
    method: opts?.method || 'GET',
    headers: opts?.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) {
    let msg = 'request_failed'
    try {
      msg = ((await res.json()) as { error?: string }).error || msg
    } catch {
      /* non-JSON error body */
    }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export const ERRORS: Record<string, string> = {
  bad_credentials: 'Wrong name or password.',
  too_many_attempts: 'Too many attempts. Please wait 15 minutes and try again.',
  password_too_short: 'Password must be at least 8 characters.',
  bad_name: 'Please enter a name (2–50 characters).',
  name_taken: 'That name is already in use.',
  bad_invite: 'This invitation link is invalid or has expired.',
  bad_setup_code: 'The setup code is not correct.',
  already_set_up: 'The owner account already exists.',
  request_failed: 'Something went wrong. Please try again.',
}

export function errorText(e: unknown): string {
  const key = e instanceof Error ? e.message : 'request_failed'
  return ERRORS[key] || ERRORS.request_failed
}
