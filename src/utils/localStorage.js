const ROLES_KEY = 'mtg_roles_v2'

export function loadRoles() {
  try {
    const raw = localStorage.getItem(ROLES_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveRoles(roles) {
  try {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles))
  } catch {
    // ignore quota errors
  }
}
