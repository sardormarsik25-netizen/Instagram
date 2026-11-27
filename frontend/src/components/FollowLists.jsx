import { useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { api } from '../api/client';
import AccountAvatar from './AccountAvatar';

export default function FollowLists({ profile }) {
  const dialog = useRef(null);
  const request = useRef(0);
  const [section, setSection] = useState('followers');
  const [users, setUsers] = useState(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const term = query.trim().toLowerCase();
  const visible = (users ?? []).filter((user) => !term ||
    (user.fullName || user.username).toLowerCase().includes(term));

  async function open(name) {
    const id = ++request.current;
    setSection(name);
    setUsers(null);
    setQuery('');
    setError('');
    dialog.current.showModal();
    try {
      const data = await api.get(`/user/${encodeURIComponent(profile.username)}/${name}`);
      if (id === request.current) setUsers(data.users);
    } catch (error) {
      if (id === request.current) setError(error.message);
    }
  }

  return (
    <>
      <div className="profile-stats">
        <div className="profile-stat"><strong>{profile.postsCount ?? '–'}</strong><span>Postlar</span></div>
        <button className="profile-stat" type="button" onClick={() => open('followers')}>
          <strong>{profile.followersCount ?? '–'}</strong><span>Obunachilar</span>
        </button>
        <button className="profile-stat" type="button" onClick={() => open('following')}>
          <strong>{profile.followingCount ?? '–'}</strong><span>Obunalar</span>
        </button>
      </div>
      <dialog ref={dialog} className="connections-dialog" aria-labelledby="connections-title">
        <div className="profile-photo-header">
          <h2 id="connections-title">{section === 'followers' ? 'Obunachilar' : 'Obunalar'}</h2>
          <form method="dialog"><button type="submit">Yopish</button></form>
        </div>
        {section === 'following' && (
          <label className="connections-filter">
            <FiSearch aria-hidden="true" />
            <input type="search" placeholder="Qidiruv" aria-label="Qidiruv" value={query}
              onChange={(event) => setQuery(event.target.value)} />
          </label>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        {!users && !error && <p role="status">Yuklanmoqda…</p>}
        {users && visible.length === 0 && <p>{term ? 'Mos obuna topilmadi.' : 'Ro‘yxat hozircha bo‘sh.'}</p>}
        <ul className="connections-list">
          {visible.map((user) => (
            <li key={user._id}>
              <AccountAvatar user={user} />
              <div className="min-w-0 flex-1 break-words">
                <strong>@{user.username}</strong>
                {user.fullName && <div>{user.fullName}</div>}
              </div>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
