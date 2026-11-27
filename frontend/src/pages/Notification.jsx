import { useEffect, useState } from 'react';
import { FiBell, FiHeart, FiMessageCircle, FiRepeat, FiUserPlus } from 'react-icons/fi';
import AccountAvatar from '../components/AccountAvatar';
import { api, imageUrl } from '../api/client';
import './account.css';

const actions = {
  follow: ['sizga obuna bo‘ldi.', FiUserPlus],
  like: ['postingizga layk bosdi.', FiHeart],
  comment: ['postingizga izoh yozdi.', FiMessageCircle],
  repost: ['postingizni storyga ulashdi.', FiRepeat],
};
const date = new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' });

export default function Notification() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const { notifications } = await api.get('/notifications');
        if (!ignore) { setItems(notifications); setError(''); }
      } catch (error) {
        if (!ignore) setError(error.message);
      }
    }
    load();
    const interval = window.setInterval(load, 15000);
    return () => { ignore = true; window.clearInterval(interval); };
  }, [retry]);

  async function readAll() {
    setMarking(true);
    try {
      await api.patch('/notifications/read-all');
      setItems((current) => current.map((item) => ({ ...item, read: true })));
    } catch (error) {
      setError(error.message);
    } finally {
      setMarking(false);
    }
  }

  return (
    <section className="account-page activity-page" aria-labelledby="notifications-title">
      <div className="activity-heading">
        <h1 id="notifications-title">Bildirishnomalar</h1>
        {items?.some((item) => !item.read) && <button className="btn btn-sm" type="button"
          disabled={marking} onClick={readAll}>Hammasini o‘qilgan qilish</button>}
      </div>
      {error && <p className="error" role="alert">{error}{' '}
        <button className="btn btn-xs" type="button" onClick={() => setRetry((value) => value + 1)}>Qayta urinish</button></p>}
      {!items && !error && <p role="status">Yuklanmoqda…</p>}
      {items?.length === 0 && <div className="activity-empty"><FiBell aria-hidden="true" /><p>Hozircha bildirishnomalar yo‘q.</p></div>}
      {items?.length > 0 && (
        <ul className="activity-list">
          {items.map((item) => {
            const [text, Icon] = actions[item.type] ?? ['yangilik yubordi.', FiBell];
            return (
              <li key={item._id} className={item.read ? undefined : 'activity-unread'}>
                <AccountAvatar user={item.sender} />
                <div className="min-w-0 break-words">
                  <strong>{item.sender ? `@${item.sender.username}` : 'Foydalanuvchi'}</strong> {text}
                  {item.text && <p>{item.text}</p>}
                  <time dateTime={item.createdAt}>{date.format(new Date(item.createdAt))}</time>
                </div>
                {item.post?.image ? <img className="activity-thumbnail" src={imageUrl(item.post.image)} alt="" loading="lazy" />
                  : <Icon aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
