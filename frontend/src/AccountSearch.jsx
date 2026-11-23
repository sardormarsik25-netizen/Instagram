import React, { useState } from 'react';
import { Avatar } from './Profile';
import { searchAccounts, updateFollow } from './social';

export default function AccountSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

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

  async function toggleFollow(account) {
    setPending(true);
    setError('');
    try {
      await updateFollow(account.id, !account.following);
      setResults((current) => current.map((user) => user.id === account.id
        ? { ...user, following: !user.following } : user));
    } catch {
      setError('Obunani o‘zgartirib bo‘lmadi. Qayta urinib ko‘ring.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="dashboard-profile" aria-labelledby="search-title">
      <h2 id="search-title">Qidiruv</h2>
      <form className="connections-search profile-form" onSubmit={search}>
        <label>
          Username bo‘yicha qidirish
          <input type="search" maxLength={30} value={query} disabled={pending}
            onChange={(event) => { setQuery(event.target.value); setResults(null); }} />
        </label>
        <button disabled={pending || !query.trim()}>Qidirish</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {results?.length === 0 && <p role="status">Akkaunt topilmadi.</p>}
      {results?.length > 0 && (
        <ul className="connections-list">
          {results.map((account) => (
            <li key={account.id}>
              <div className="activity-account">
                <Avatar initial={account.username[0].toUpperCase()} />
                <div>
                  <strong>@{account.username}</strong>
                  {account.fullName && <div>{account.fullName}</div>}
                </div>
              </div>
              <button type="button" disabled={pending} onClick={() => toggleFollow(account)}>
                {account.following ? 'Obunani bekor qilish' : 'Obuna bo‘lish'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
