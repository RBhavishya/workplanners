import React from 'react';
import { Outlet, useMatch } from '@tanstack/react-router';
import Sidebar from './Sidebar';
import Header from './Header';
import CustomCenter from './CustomCenter';

const MainLayout = () => {
  const tasksMatch = useMatch({ from: '/_layout/tasks/', shouldThrow: false });
  const dashboardMatch = useMatch({ from: '/_layout/dashboard/', shouldThrow: false });
  const projectsMatch = useMatch({ from: '/_layout/projects/', shouldThrow: false });

  const getRenderCenter = () => {
    if (tasksMatch) {
      return () => <CustomCenter cards={[]} />; 
    }
    if (dashboardMatch) {
      return null; 
    }
    if (projectsMatch) {
      return () => null;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-purple-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-56">
        <Header renderCenter={getRenderCenter()} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;