import { FiHeart, FiHome, FiMessageCircle, FiPlusSquare, FiSearch, FiUser, FiVideo } from 'react-icons/fi';

export const navItems = [
  { label: 'Home', to: '/', icon: FiHome },
  { label: 'Search', to: '/search', icon: FiSearch },
  { label: 'Reels', to: '/reels', icon: FiVideo },
  { label: 'Post', to: '/post', icon: FiPlusSquare },
  { label: 'Notifications', to: '/notifications', icon: FiHeart },
  { label: 'Chat', to: '/chat', icon: FiMessageCircle },
  { label: 'Profile', to: '/profile', icon: FiUser },
];
