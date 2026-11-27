import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordToggle = ({ visible, onToggle }) => (
  <button
    type="button"
    className="btn btn-ghost btn-circle btn-xs opacity-60"
    aria-label={visible ? 'Parolni yashirish' : "Parolni ko'rsatish"}
    onClick={onToggle}
  >
    {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
  </button>
);

export default PasswordToggle;
