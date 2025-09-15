import { useLocation } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { NotificationIcon } from '../icons/NotificationIcon';

type HeaderProps = {
  renderCenter?: (() => React.ReactNode) | null;
};

const Header: React.FC<HeaderProps> = ({ renderCenter }) => {
  const [time, setTime] = useState(new Date('2025-09-12T13:43:00+05:30'));
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const location = useLocation();

  const formattedTime = time.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  });
  const formattedDate = time.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const defaultCenter =
  location.pathname === "/dashboard" ? (
    <div className="flex-1 max-w-md mx-2">
      <div className="flex items-center border border-black/40 rounded-full p-1.5">
        <Search className="w-5 h-5 mx-2" />
        <input
          type="text"
          placeholder="Find your Task, Projects.."
          className="bg-transparent outline-none w-full text-gray-700 placeholder:text-gray-400 placeholder:text-sm text-sm 3xl:!text-base"
        />
      </div>
    </div>
  ) : null;

  const centerContent = renderCenter ? renderCenter() : defaultCenter;

  return (
    <header
      className="
        flex items-center justify-between
        px-4 bg-white border-b border-gray-300 shadow-none
        h-18 3xl:!h-26                      
      "
    >
      {centerContent}
      <div className="flex items-center space-x-6">
        <div className="border-r-2 border-gray-200 w-30 border-l-2 text-center">
          <p className="text-base 3xl:!text-lg font-medium text-gray-800">{formattedTime}</p>
          <p className="text-xs 3xl:!text-sm text-gray-500">{formattedDate}</p>
        </div>
        <div className="relative bg-blue-100 h-10 w-10 flex items-center justify-center rounded-full">
          <NotificationIcon />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            33
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
