import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiInstagram, FiLogOut } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { navItems } from '../constants/navItems';
import { logout } from '../store/authSlice';

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-base-200 font-semibold' : 'hover:bg-base-200'
  }`;

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.info('Sessiya tugatildi');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-base-300 px-4 py-6 md:flex">
      <NavLink to="/" className="mb-8 flex items-center gap-2 px-3 text-xl font-bold">
        <FiInstagram />
        Instagram
      </NavLink>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={navClass}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="btn btn-ghost w-full justify-start gap-3 font-normal normal-case"
        onClick={handleLogout}
      >
        <FiLogOut size={20} />
        Chiqish
      </button>
    </aside>
  );
};

export default Sidebar;
