import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { authRequest } from './store/authApi';
import { setUser } from './store/authSlice';

const App = () => {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    authRequest('me', undefined, controller.signal).then((user) => {
      if (controller.signal.aborted) return;
      dispatch(setUser(user));
      setReady(true);
    }).catch((error) => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [dispatch, retry]);

  if (ready) return <AppRoutes />;
  return (
    <main className="grid min-h-screen place-content-center gap-3 p-6">
      {error ? (
        <>
          <p role="alert">{error}</p>
          <button className="btn btn-primary" onClick={() => {
            setError('');
            setRetry((value) => value + 1);
          }}>Qayta urinish</button>
        </>
      ) : <p role="status">Sessiya tekshirilmoqda…</p>}
    </main>
  );
};

export default App;
