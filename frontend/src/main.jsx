import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { authRequest, persistor, store } from './auth';
import Dashboard from './Dashboard';
import './style.css';

function Field({ label, name, type = 'text', autoComplete, ...rules }) {
  return (
    <label>
      {label}
      <input name={name} type={type} autoComplete={autoComplete} required {...rules} />
    </label>
  );
}

function PasswordField({ registering }) {
  const [visible, setVisible] = useState(false);
  const toggleLabel = visible ? 'Parolni yashirish' : 'Parolni koʻrsatish';

  return (
    <div className="password-field">
      <label htmlFor="password">Parol</label>
      <div className="password-input">
        <input
          id="password"
          name="password"
          type={visible ? 'text' : 'password'}
          autoComplete={registering ? 'new-password' : 'current-password'}
          aria-describedby={registering ? 'password-rules' : undefined}
          minLength={8}
          maxLength={128}
          required
        />
        <button type="button" className="password-toggle" aria-label={toggleLabel}
          title={toggleLabel} onClick={() => setVisible(!visible)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="2.5" />
            {visible && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </div>
    </div>
  );
}

function Account() {
  const dispatch = useDispatch();
  const { user, verified, pending, error } = useSelector((state) => state.auth);
  const [path, setPath] = useState(location.pathname);
  const registering = path === '/register';

  useEffect(() => {
    dispatch(authRequest('me'));
  }, [dispatch]);

  useEffect(() => {
    if (!verified) return;
    const destination = user ? '/dashboard' : path === '/dashboard' ? '/login' : path;
    if (destination !== path) {
      history.replaceState(null, '', destination);
      setPath(destination);
    }
  }, [path, user, verified]);

  function submit(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    dispatch(authRequest(registering ? 'register' : 'login', fields));
  }

  if (verified && user) {
    return (
      <Dashboard user={user} pending={pending} error={error}
        onLogout={() => dispatch(authRequest('logout'))}
        onSaveProfile={(fields) => dispatch(authRequest('profile', fields))} />
    );
  }

  if (!verified) {
    return (
      <AuthLayout>
        <h1>Hisobingiz</h1>
        {pending ? <p role="status">Sessiya tekshirilmoqda…</p> : (
          <>
            <p role="alert">{error}</p>
            <button onClick={() => dispatch(authRequest('me'))}>Qayta urinish</button>
          </>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1>{registering ? 'Hisob yarating' : 'Hisobga kiring'}</h1>
      <form onSubmit={submit}>
        {registering ? (
          <>
            <Field label="Foydalanuvchi nomi" name="username" autoComplete="username"
              minLength={3} maxLength={30} pattern="[A-Za-z0-9._]{3,30}"
              aria-describedby="username-rules" />
            <small id="username-rules">3–30 belgi. Lotin harflari, raqam, nuqta yoki pastki chiziq.</small>
            <Field label="E-pochta" name="email" type="email" autoComplete="email" maxLength={254} />
          </>
        ) : (
          <Field label="Foydalanuvchi nomi yoki e-pochta" name="identifier" autoComplete="username" maxLength={254} />
        )}
        <PasswordField registering={registering} />
        {registering && <small id="password-rules">Kamida 8 belgi.</small>}
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={pending}>
          {pending ? 'Yuborilmoqda…' : registering ? 'Roʻyxatdan oʻtish' : 'Kirish'}
        </button>
      </form>
      <p className="switch">
        {registering ? 'Hisobingiz bormi?' : 'Hisobingiz yoʻqmi?'}{' '}
        <a href={registering ? '/login' : '/register'}>
          {registering ? 'Kirish' : 'Roʻyxatdan oʻtish'}
        </a>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ children }) {
  return (
    <main className="layout">
      <section className="card" aria-label="Instagram hisobi">
        <div className="instagram-brand">
          <span className="instagram-icon" aria-hidden="true"><span /></span>
          <span>Instagram</span>
        </div>
        {children}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={<AuthLayout><p role="status">Yuklanmoqda…</p></AuthLayout>} persistor={persistor}>
      <Account />
    </PersistGate>
  </Provider>,
);
