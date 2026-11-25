import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Sidebar from '../components/Sidebar';

const MainLayout = () => (
  <div className="min-h-screen bg-base-100 text-base-content">
    <div className="mx-auto flex max-w-5xl">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
    <BottomNav />
  </div>
);

export default MainLayout;
