import React, { useEffect, useState } from "react";
import UserDetails from "../login/UserDetails";
import { useLocation } from "@tanstack/react-router";

type HeaderProps = {
  renderCenter?: (() => React.ReactNode) | null;
};

const Header: React.FC<HeaderProps> = ({ renderCenter }) => {
  const [time, setTime] = useState(new Date("2025-09-12T13:43:00+05:30"));
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const location = useLocation();

  const formattedTime = time.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
  const formattedDate = time.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });

  const defaultCenter =
    location.pathname === "/dashboard" ? (
      <div className="flex-1 max-w-md mx-2">
        {/* <div className='border-b p-3'> <UserDetails/></div> */}
        {/* <div className="flex items-center bg-purple-50 border border-purple-200 rounded-full p-2">
        <Search className="w-5 h-5 text-purple-500 mr-2" />
        <input
          type="text"
          placeholder="Find your Task, Projects.."
          className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-500"
        />
      </div> */}
      </div>
    ) : null;

  const centerContent = renderCenter ? renderCenter() : defaultCenter;

  return (
    <header
      className="
        flex items-center justify-between
        p-2 bg-white border-b                     
      "
    >
      {centerContent}
      <div className="flex items-center justify-end w-full">
        <div className="flex items-center space-x-6">
          <UserDetails />
        </div>
      </div>
    </header>
  );
};

export default Header;
