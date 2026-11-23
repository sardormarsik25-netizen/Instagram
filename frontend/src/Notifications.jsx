import React, { useEffect, useState } from 'react';
import { Avatar } from './Profile';

export function useNotifications(userId, open) {
  const key = `notification-seen:${userId}`;
  const [seen, setSeen] = useState(() => {
    try {
      return Number(localStorage.getItem(key)) || 0;
    } catch {
      return 0;
    }
  });
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/auth/notifications', { signal: controller.signal });
        if (!response.ok) throw new Error();
        setItems((await response.json()).items);
        setError(false);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }
    load();
    const interval = window.setInterval(load, 15000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, [open, retry]);

  const latest = items?.length ? Date.parse(items[0].createdAt) : 0;
  useEffect(() => {
    if (!open || latest <= seen) return;
    setSeen(latest);
    try {
      localStorage.setItem(key, String(latest));
    } catch {
      // Read status still applies while the dashboard is open.
    }
  }, [key, latest, open, seen]);

  const unread = open ? 0 : (items ?? []).filter((item) => Date.parse(item.createdAt) > seen).length;
  return { items, error, retry: () => setRetry((value) => value + 1), unread };
}

const actions = {
  follow: 'sizga obuna bo‘ldi.',
  story: 'storyingizga layk bosdi.',
  note: 'zametkangizga layk bosdi.',
};
const activityDate = new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' });

export default function Notifications({ items, error, retry }) {
  return (
    <section className="dashboard-profile" aria-labelledby="notifications-title">
      <h2 id="notifications-title">Bildirishnomalar</h2>
      {error && <p className="error" role="alert">Bildirishnomalar yuklanmadi. <button type="button"
        className="note-button" onClick={retry}>Qayta urinish</button></p>}
      {!items && !error && <p role="status">Yuklanmoqda…</p>}
      {items?.length === 0 && <p>Hozircha bildirishnomalar yo‘q.</p>}
      {items?.length > 0 && (
        <ul className="connections-list">
          {items.map((item) => (
            <li key={item.id}>
              <div className="activity-account">
                <Avatar initial={item.username[0].toUpperCase()} />
                <div>
                  <strong>@{item.username}</strong> {actions[item.kind]}
                  <time dateTime={item.createdAt}>{activityDate.format(new Date(item.createdAt))}</time>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
