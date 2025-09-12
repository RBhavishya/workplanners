import React, { useEffect, useState } from 'react';
import { Search, Bell } from 'lucide-react';

const Header = ({ renderCenter }) => {
  const [time, setTime] = useState(new Date('2025-09-11T14:35:00+05:30')); 

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  const defaultCenter = (
    <div className="flex-1 max-w-md mx-4">
      <div className="flex items-center bg-purple-50 border border-purple-200 rounded-full px-4 py-2">
        <Search className="w-5 h-5 text-purple-500 mr-2" />
        <input
          type="text"
          placeholder="Find your Task, Projects.."
          className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-500"
        />
      </div>
    </div>
  );

  const centerContent = renderCenter ? renderCenter() : defaultCenter;

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-purple-100 shadow-sm">
      {centerContent}
      <div className="flex items-center space-x-4">
        <div className="border-l border-purple-100 px-4 text-right">
          <p className="text-lg font-semibold text-gray-800">{formattedTime}</p>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
        <div className="relative">
          <Bell className="w-6 h-6 text-purple-500 cursor-pointer" />
          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] flex items-center justify-center">
            33
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;