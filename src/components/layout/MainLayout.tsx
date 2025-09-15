import React from 'react';
import { Outlet, useMatch } from '@tanstack/react-router';
import Sidebar from './Sidebar';
import Header from './Header';
import CustomCenter from './CustomCenter';
import { EmployeeIcon } from '../icons/EmployeeIcon';

const MainLayout = () => {
  const tasksMatch = useMatch({ from: '/_layout/tasks/', shouldThrow: false });
  const dashboardMatch = useMatch({ from: '/_layout/dashboard/', shouldThrow: false });
  const projectsMatch = useMatch({ from: '/_layout/projects/', shouldThrow: false });

  const getRenderCenter = () => {
    if (tasksMatch) {
      return () => 
      <CustomCenter cards={[
        { title: "TODAY", value: 29 },
        { title: "OVERDUE", value: 24 },
        { title: "CLOSED", value: 3 },
      ]}
      />
    ;
    }
    if (projectsMatch) {
      return () => null; // Placeholder for projects view
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-purple-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header renderCenter={getRenderCenter()} />
        <main className="flex-1 overflow-y-auto p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;