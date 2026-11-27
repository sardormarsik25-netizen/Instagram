export const connectionsUrl = '/api/auth/connections';

export async function searchAccounts(query) {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`${connectionsUrl}/search?${params}`);
  if (!response.ok) throw new Error('Search failed');
  return (await response.json()).users;
}

async function update(url, fields) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!response.ok) throw new Error('Update failed');
}

export function updateFollow(userId, follow) {
  return update(connectionsUrl, { userId, follow });
}

export function updateReaction(kind, id, liked, expiresAt) {
  return update('/api/auth/reactions', { kind, id, liked, expiresAt });
}
