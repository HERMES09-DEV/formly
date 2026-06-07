export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function inviteEmailMatches(inviteEmail: string, userEmail: string) {
  return normalizeEmail(inviteEmail) === normalizeEmail(userEmail);
}
