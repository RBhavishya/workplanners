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
  const teams = [
    { name: 'Designing Team', avatar: '👩‍🎨', count: 5 },
    { name: 'Development Team', avatar: '👨‍💻', count: 5 },
    { name: 'Testing Team', avatar: '🧪', count: 5 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-purple-200 fixed left-0 top-0 h-full p-4 flex flex-col shadow-sm z-10">
      <UserDetails />    
      <hr className="my-10 border-purple-100" />
      <h2 className="text-xs font-semibold text-purple-600 mb-4 uppercase tracking-wide">Menu</h2>
      <nav className="flex flex-col space-y-1 mb-6">
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
        {/* <Link
          to="/notifications"
          className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-purple-100 hover:text-purple-600 transition-colors"
          activeProps={{ className: 'bg-purple-100 text-purple-600 font-medium' }}
        >
          <Bell className="mr-3 w-4 h-4" />
          Notifications
        </Link> */}
      </nav>

      <hr className="my-6 border-purple-100" />
      <h2 className="text-xs font-semibold text-purple-600 mb-4 uppercase tracking-wide flex items-center">
        Teams <ChevronDown className="ml-1 w-3 h-3" />
      </h2>
      <div className="space-y-3">
        {teams.map((team, idx) => (
          <div key={idx} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium">
              {team.avatar}
            </div>
            <span className="text-sm font-medium text-gray-700">{team.name}</span>
            <span className="ml-auto text-xs text-purple-600">{team.count}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-purple-100">
        <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Sun Pharma</span>
          <span className="ml-auto text-xs text-green-600 font-semibold">+11.3%</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;