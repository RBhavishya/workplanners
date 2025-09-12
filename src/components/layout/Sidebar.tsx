import React from 'react';
import { Link } from '@tanstack/react-router';
import {
  LayoutDashboard,
  ClipboardList,
  NotebookPen,
  Bell,
  Users,
  ChevronDown,
} from 'lucide-react';
import UserDetails from '../login/UserDetails';

const Sidebar = () => {

  return (
    <aside className="w-64 bg-white border-r border-purple-200 fixed left-0 top-0 h-full p-6 flex flex-col shadow-sm z-10">
     <div className='border-b h-24'> <UserDetails/></div>
      <h2 className="text-xs font-semibold text-purple-600 mb-6 uppercase tracking-wide mt-5">Menu</h2>
      <nav className="flex flex-col space-y-2 mb-8">
        <Link
          to="/dashboard"
          className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-purple-100 hover:text-purple-600 transition-colors"
          activeProps={{ className: 'bg-purple-100 text-purple-600 font-medium' }}
        >
          <LayoutDashboard className="mr-3 w-4 h-4" />
          Dashboard
        </Link>
        <Link
          to="/tasks"
          className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-purple-100 hover:text-purple-600 transition-colors"
          activeProps={{ className: 'bg-purple-100 text-purple-600 font-medium' }}
        >
          <ClipboardList className="mr-3 w-4 h-4" />
          Tasks
        </Link>
        <Link
          to="/projects"
          className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-purple-100 hover:text-purple-600 transition-colors"
          activeProps={{ className: 'bg-purple-100 text-purple-600 font-medium' }}
        >
          <NotebookPen className="mr-3 w-4 h-4" />
          Projects
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;