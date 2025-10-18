import { Outlet } from '@tanstack/react-router';
import Sidebar from './Sidebar';
import { Header } from './Header';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-violet-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-54"> 
        <Header renderCenter={() => null} />
        <main className="flex-1 overflow-y-auto p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;