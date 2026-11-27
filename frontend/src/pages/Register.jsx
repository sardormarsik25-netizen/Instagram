import { useState } from 'react';
import { FiAlertCircle, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerRequest } from '../api/auth';
import AuthField from '../components/AuthField';
import PasswordToggle from '../components/PasswordToggle';
import { registerSuccess } from '../store/authSlice';

// Client-side checks before sending to the backend
const validate = ({ username, password }) => {
  const errors = {};
  if (!/^[a-z0-9._]{3,30}$/.test(username)) {
    errors.username = "3-30 ta belgi: kichik harf, raqam, nuqta yoki _";
  }
  if (password.length < 6) {
    errors.password = "Parol kamida 6 ta belgi bo'lsin";
  }
  return errors;
};

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: name === 'username' ? value.toLowerCase() : value });
    setErrors({ ...errors, [name]: '' });
    setServerError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, username: form.username.trim(), email: form.email.trim() };
    const nextErrors = validate(payload);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const data = await registerRequest(payload);
      dispatch(registerSuccess({ user: data.user, token: data.token || null }));
      toast.success('Hisob yaratildi');
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <form onSubmit={handleSubmit} className="card-body gap-4 p-8" noValidate>
          <div className="mb-2 text-center">
            <h1 className="font-logo text-5xl">Instagram</h1>
            <p className="mt-3 text-sm font-medium text-base-content/60">
              Do'stlaringizning surat va videolarini ko'rish uchun ro'yxatdan o'ting.
            </p>
          </div>

          {serverError && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <FiAlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <AuthField
            id="username"
            label="Foydalanuvchi nomi"
            icon={FiUser}
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="foydalanuvchi"
            autoComplete="username"
            error={errors.username}
            required
          />

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
            placeholder="Kamida 6 ta belgi"
            autoComplete="new-password"
            error={errors.password}
            required
            trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
          />

          <button className="btn btn-primary mt-2 w-full" type="submit" disabled={loading}>
            {loading && <span className="loading loading-spinner loading-sm" />}
            Ro'yxatdan o'tish
          </button>
        </form>
      </div>

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body items-center p-5 text-sm">
          <p>
            Hisobingiz bormi?{' '}
            <Link className="link link-primary font-semibold no-underline" to="/login">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
