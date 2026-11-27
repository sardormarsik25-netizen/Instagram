import { imageUrl } from '../api/client';

export default function AccountAvatar({ user }) {
  return (
    <span className="dashboard-avatar" aria-hidden="true">
      {user?.avatar ? <img src={imageUrl(user.avatar)} alt="" /> : (user?.username?.[0] || '?').toUpperCase()}
    </span>
  );
}
