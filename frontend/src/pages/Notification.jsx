import { useEffect, useState } from 'react';
import { FiBell, FiHeart, FiUserPlus } from 'react-icons/fi';
import { Avatar } from '../components/Profile';
import './account.css';

const actions = {
  follow: 'sizga obuna bo‘ldi.',
  story: 'storyingizga layk bosdi.',
  note: 'zametkangizga layk bosdi.',
};
const date = new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' });

export default function Notification() {
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
  }, [retry]);

  return (
    <section className="account-page activity-page" aria-labelledby="notifications-title">
      <h1 id="notifications-title">Bildirishnomalar</h1>
      {error && <p className="error" role="alert">Bildirishnomalar yuklanmadi.{' '}
        <button type="button" className="btn btn-xs" onClick={() => setRetry(retry + 1)}>Qayta urinish</button></p>}
      {!items && !error && <p role="status">Yuklanmoqda…</p>}
      {items?.length === 0 && <div className="activity-empty"><FiBell aria-hidden="true" /><p>Hozircha bildirishnomalar yo‘q.</p></div>}
      {items?.length > 0 && (
        <ul className="activity-list">
          {items.map((item) => (
            <li key={item.id}>
              <Avatar initial={item.username[0].toUpperCase()} />
              <div>
                <strong>@{item.username}</strong> {actions[item.kind]}
                <time dateTime={item.createdAt}>{date.format(new Date(item.createdAt))}</time>
              </div>
              {item.kind === 'follow' ? <FiUserPlus aria-hidden="true" /> : <FiHeart aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
