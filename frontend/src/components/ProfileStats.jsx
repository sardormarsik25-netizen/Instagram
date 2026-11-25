import { useEffect, useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { connectionsUrl, updateFollow } from './social';
const titles = { followers: 'Obunachilar', following: 'Obunalar' };

export default function ProfileStats() {
  const dialog = useRef(null);
  const [connections, setConnections] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [section, setSection] = useState('followers');
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(connectionsUrl, { signal: controller.signal });
        if (!response.ok) throw new Error();
        setConnections(await response.json());
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      }
    }
    load();
    return () => controller.abort();
  }, [reload]);

  function open(name) {
    setSection(name);
    setQuery('');
    setError('');
    dialog.current.showModal();
  }

  async function changeFollow(account, follow) {
    setPending(true);
    setError('');
    try {
      await updateFollow(account.id, follow);
      setConnections((current) => {
        const otherAccounts = current.following.filter(({ id }) => id !== account.id);
        return { ...current, following: follow ? [account, ...otherAccounts] : otherAccounts };
      });
    } catch {
      setError('Obunani o‘zgartirib bo‘lmadi. Qayta urinib ko‘ring.');
    } finally {
      setPending(false);
    }
  }

  const list = connections?.[section] ?? [];
  const term = query.trim().toLowerCase();
  const accounts = section === 'following' && term
    ? list.filter((account) => (account.fullName || account.username).toLowerCase().includes(term))
    : list;
  const followingIds = new Set(connections?.following.map(({ id }) => id));

  return (
    <>
      <div className="profile-stats">
        <div className="profile-stat"><strong>0</strong><span>Postlar</span></div>
        {Object.entries(titles).map(([name, title]) => (
          <button type="button" key={name} className="profile-stat" disabled={!connections || pending}
            onClick={() => open(name)}>
            <strong>{connections?.[name].length ?? '–'}</strong><span>{title}</span>
          </button>
        ))}
      </div>
      {loadError && (
        <p className="error" role="alert">
          Obunalar yuklanmadi. <button className="note-button" type="button"
            onClick={() => { setLoadError(false); setReload(reload + 1); }}>Qayta urinish</button>
        </p>
      )}
      <dialog ref={dialog} className="profile-photo-dialog connections-dialog" aria-labelledby="connections-title">
        <div className="profile-photo-header">
          <h3 id="connections-title">{titles[section]}</h3>
          <form method="dialog"><button type="submit">Yopish</button></form>
        </div>
        {section === 'following' && (
          <label className="connections-filter">
            <FiSearch aria-hidden="true" />
            <input type="search" aria-label="Qidiruv" placeholder="Qidiruv" value={query}
              onChange={(event) => setQuery(event.target.value)} />
          </label>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        {accounts.length === 0 ? <p>{term ? 'Mos obuna topilmadi.' : 'Ro‘yxat hozircha bo‘sh.'}</p> : (
          <ul className="connections-list">
            {accounts.map((account) => {
              const isFollowing = followingIds.has(account.id);
              return (
                <li key={account.id}>
                  <div>
                    <strong>@{account.username}</strong>
                    {account.fullName && <div>{account.fullName}</div>}
                  </div>
                  <button type="button" disabled={pending} onClick={() => changeFollow(account, !isFollowing)}>
                    {isFollowing ? 'Obunani bekor qilish' : 'Obuna bo‘lish'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </dialog>
    </>
  );
}
