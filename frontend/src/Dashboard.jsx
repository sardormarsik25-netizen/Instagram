import React, { useEffect, useState } from 'react';
import Profile from './Profile';
import Stories from './Stories';
import ChatNotes from './ChatNotes';
import AccountSearch from './AccountSearch';
import Notifications, { useNotifications } from './Notifications';

const sections = { feed: 'Lenta', chats: 'Chats', profile: 'Profil', search: 'Qidiruv', notifications: 'Bildirishnomalar' };

function activeSection() {
  const hash = location.hash.slice(1);
  return Object.hasOwn(sections, hash) ? hash : 'feed';
}

export default function Dashboard({ user, pending, error, onLogout, onSaveProfile }) {
  const [section, setSection] = useState(activeSection);
  const notifications = useNotifications(user.id, section === 'notifications');
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('dashboard-theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    function switchSection() {
      setSection(activeSection());
    }
    window.addEventListener('hashchange', switchSection);
    return () => window.removeEventListener('hashchange', switchSection);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('dashboard-theme', nextTheme);
    } catch {
      // Keep the selected theme for this visit if storage is unavailable.
    }
  }

  return (
    <div className="dashboard" data-theme={theme}>
      <aside className="dashboard-sidebar">
        <a className="instagram-brand" href="/dashboard">
          <span className="instagram-icon" aria-hidden="true"><span /></span>
          <span>Instagram</span>
        </a>
        <nav aria-label="Dashboard">
          {Object.entries(sections).map(([key, label]) => (
            <a key={key} href={`#${key}`} aria-current={section === key ? 'location' : undefined}>
              {label}
              {key === 'notifications' && notifications.unread > 0 && (
                <span className="notification-count">{notifications.unread}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="dashboard-actions">
          <button className="theme-toggle" type="button" onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'}>
            <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
          </button>
        </div>
      </aside>
      <main className="dashboard-main">
        {section === 'feed' && <header className="dashboard-header"><Stories user={user} /></header>}
        <div className="dashboard-content">
          {section === 'feed' && <section id="feed" aria-labelledby="feed-title">
            <h1 id="feed-title" className="dashboard-section-title">Lenta</h1>
            <div className="feed-empty">
              <span className="feed-icon" aria-hidden="true"><span /></span>
              <h3>Hozircha postlar yo‘q</h3>
            </div>
          </section>}
          {section === 'profile' && <Profile user={user} pending={pending} error={error}
            onLogout={onLogout} onSave={onSaveProfile} />}
          {section === 'search' && <AccountSearch />}
          {section === 'notifications' && <Notifications {...notifications} />}
          {section === 'chats' && <section id="chats" aria-labelledby="chats-title">
            <h2 id="chats-title">Chats</h2>
            <ChatNotes user={user} />
            <div className="feed-empty">
              <span className="feed-icon chat-icon" aria-hidden="true"><span /></span>
              <h3>Hozircha suhbatlar yo‘q</h3>
            </div>
          </section>}
        </div>
      </main>
    </div>
  );
}
