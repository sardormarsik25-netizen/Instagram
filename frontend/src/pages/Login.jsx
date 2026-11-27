import { useState } from 'react';
import { FiAlertCircle, FiLock, FiMail } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginRequest } from '../api/auth';
import AuthField from '../components/AuthField';
import PasswordToggle from '../components/PasswordToggle';
import { loginSuccess } from '../store/authSlice';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await loginRequest({ email: form.email.trim(), password: form.password });
      dispatch(loginSuccess({ user: data.user, token: data.token || null }));
      toast.success(`Xush kelibsiz, ${data.user.username}`);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <form onSubmit={handleSubmit} className="card-body gap-4 p-8">
          <h1 className="font-logo mb-2 text-center text-5xl">Instagram</h1>

          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <AuthField
            id="email"
            label="Email"
            icon={FiMail}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@example.com"
            autoComplete="email"
            required
          />

          <AuthField
            id="password"
            label="Parol"
            icon={FiLock}
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Parolingiz"
            autoComplete="current-password"
            required
            trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
          />

          <button className="btn btn-primary mt-2 w-full" type="submit" disabled={loading}>
            {loading && <span className="loading loading-spinner loading-sm" />}
            Kirish
          </button>
        </form>
      </div>

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body items-center p-5 text-sm">
          <p>
            Hisobingiz yo'qmi?{' '}
            <Link className="link link-primary font-semibold no-underline" to="/register">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
