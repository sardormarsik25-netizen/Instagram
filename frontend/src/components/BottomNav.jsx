import { NavLink } from 'react-router-dom';
import { navItems } from '../constants/navItems';

const BottomNav = () => (
  <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-base-300 bg-base-100 py-2 md:hidden">
    {navItems.map(({ label, to, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        aria-label={label}
        className={({ isActive }) => (isActive ? 'text-primary' : 'text-base-content/60')}
      >
        <Icon size={22} />
      </NavLink>
    ))}
  </nav>
);

export default BottomNav;
