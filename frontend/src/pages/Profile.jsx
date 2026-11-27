import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProfileCard from '../components/Profile';
import { authRequest } from '../store/authApi';
import { setUser } from '../store/authSlice';
import './account.css';

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function update(operation, fields) {
    setPending(true);
    setError('');
    try {
      dispatch(setUser(await authRequest(operation, fields)));
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="account-page">
      <ProfileCard user={user} pending={pending} error={error}
        onSave={(fields) => update('profile', fields)} onLogout={() => update('logout')} />
    </div>
  );
}
