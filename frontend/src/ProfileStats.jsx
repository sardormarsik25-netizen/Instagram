import React, { useEffect, useRef, useState } from 'react';
import { connectionsUrl, searchAccounts, updateFollow } from './social';
const titles = { followers: 'Obunachilar', following: 'Obunalar' };

export default function ProfileStats() {
  const dialog = useRef(null);
  const [connections, setConnections] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [section, setSection] = useState('followers');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
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
    setResults(null);
    setError('');
    dialog.current.showModal();
  }

  async function search(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      setResults(await searchAccounts(query));
    } catch {
      setError('Qidiruv amalga oshmadi. Qayta urinib ko‘ring.');
    } finally {
      setPending(false);
    }
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

  const accounts = results ?? connections?.[section] ?? [];
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
          <form className="connections-search profile-form" onSubmit={search}>
            <label>
              Username bo‘yicha qidirish
              <input type="search" maxLength={30} value={query} disabled={pending}
                onChange={(event) => { setQuery(event.target.value); setResults(null); }} />
            </label>
            <button type="submit" disabled={pending || !query.trim()}>Qidirish</button>
          </form>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        {accounts.length === 0 ? <p>{results ? 'Akkaunt topilmadi.' : 'Ro‘yxat hozircha bo‘sh.'}</p> : (
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
