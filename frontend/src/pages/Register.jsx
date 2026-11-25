import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthField from '../components/AuthField';
import { setUser } from '../store/authSlice';
import { authRequest } from '../store/authApi';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
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
      dispatch(setUser(await authRequest('register', form)));
      toast.success('Hisob yaratildi');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Hisob yaratish</h1>
        <p className="mt-2 text-sm text-base-content/70">Bir daqiqada ro'yxatdan o'ting.</p>
      </div>

      <div className="flex flex-col gap-4">
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
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9._]{3,30}"
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
          placeholder="Kamida 8 ta belgi"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
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
        Ro'yxatdan o'tish
      </button>

      <p className="text-center text-sm text-base-content/70">
        Hisobingiz bormi?{' '}
        <Link className="link link-primary font-semibold no-underline hover:underline" to="/login">
          Kirish
        </Link>
      </p>

    </form>
  );
};

export default Register;
