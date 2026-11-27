import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthField from '../components/AuthField';
import { setUser } from '../store/authSlice';
import { authRequest } from '../store/authApi';

const Login = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    try {
      dispatch(setUser(await authRequest('login', form)));
      toast.success('Xush kelibsiz');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Xush kelibsiz</h1>
        <p className="mt-2 text-sm text-base-content/70">Hisobingizga kirish uchun ma'lumotlaringizni kiriting.</p>
      </div>

      <div className="flex flex-col gap-4">
        <AuthField
          id="identifier"
          label="Email yoki foydalanuvchi nomi"
          icon={FiMail}
          type="text"
          name="identifier"
          value={form.identifier}
          onChange={handleChange}
          placeholder="email@example.com"
          autoComplete="username"
          maxLength={254}
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
          trailing={
            <button
              className="btn btn-ghost btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2 text-base-content/50"
              type="button"
              aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko rsatish'}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          }
        />
      </div>

      <button className="btn btn-primary w-full transition-transform active:scale-[0.99]" type="submit" disabled={pending}>
        Kirish
      </button>

      <p className="text-center text-sm text-base-content/70">
        Hisobingiz yo'qmi?{' '}
        <Link className="link link-primary font-semibold no-underline hover:underline" to="/register">
          Ro'yxatdan o'tish
        </Link>
      </p>

    </form>
  );
};

export default Login;
