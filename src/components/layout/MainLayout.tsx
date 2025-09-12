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
      return () => <CustomCenter cards={[
        { title: "Total Tasks", value: 29 },
        { title: "Completed Tasks", value: 24 },
        { title: "In Progress Task", value: 3 },
        { title: "Pending Tasks", value: 1 }
      ]} />;
    }
    if (projectsMatch) {
      return () => null; // Placeholder for projects view
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-purple-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64"> {/* Adjusted ml-64 to match sidebar width */}
        <Header renderCenter={getRenderCenter()} />
        <main className="flex-1 overflow-y-auto p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;