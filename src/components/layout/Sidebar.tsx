import { Link } from '@tanstack/react-router';
import {
  ClipboardList,
  LayoutGrid,
  NotebookPen
} from 'lucide-react';
import UserDetails from '../login/UserDetails';

const Sidebar = () => {

  return (
    <aside className="w-64 bg-white border-r border-purple-200 fixed left-0 top-0 h-full p-6 flex flex-col shadow-sm z-10">
     <div className='border-b h-13'> <UserDetails/></div>
      <nav className="flex flex-col space-y-4 my-4">
        <Link
          to="/dashboard"
          className="flex items-center px-3 py-1 rounded-none text-gray-700 hover:bg-[rgba(237,239,252,0.80)] hover:text-violet-700 transition-colors text-sm 3xl:!text-base focus:ring-0 focus:outline-0"
          activeProps={{ className: 'bg-[rgba(237,239,252,0.80)] text-violet-700 font-normal' }}
        >
          <LayoutGrid className="mr-3 w-4 h-4" strokeWidth={1.5}/>
          Dashboard
        </Link>
        <Link
          to="/tasks"
          className="flex items-center px-3 py-1 rounded-none text-gray-700 hover:bg-[rgba(237,239,252,0.80)] hover:text-violet-700 transition-colors text-sm 3xl:!text-base focus:ring-0 focus:outline-0"
          activeProps={{ className: 'bg-[rgba(237,239,252,0.80)] text-violet-700 font-normal' }}
        >
          <ClipboardList className="mr-3 w-4 h-4" strokeWidth={1.5}/>
          Tasks
        </Link>
        <Link
          to="/projects"
          className="flex items-center px-3 py-1 rounded-none text-gray-700 hover:bg-[rgba(237,239,252,0.80)] hover:text-violet-700 transition-colors text-sm 3xl:!text-base focus:ring-0 focus:outline-0"
          activeProps={{ className: 'bg-[rgba(237,239,252,0.80)] text-violet-700 font-normal' }}
        >
          <NotebookPen className="mr-3 w-4 h-4"  strokeWidth={1.5}/>
          Projects
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;