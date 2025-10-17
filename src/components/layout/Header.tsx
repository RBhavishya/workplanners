import { useLocation } from "@tanstack/react-router";
import { useState } from "react";
import UserDetails from "../login/UserDetails";
import { NotificationsPopover } from "./NotificationsPopover";

export const Header = ({ renderCenter }) => {
  const location = useLocation();

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
    <header className="flex items-center justify-between p-2 bg-white border-b">
      {centerContent}
      <div className="flex items-center justify-end w-full">
        <div className="flex items-center space-x-6">
          <NotificationsPopover />
          <UserDetails />
        </div>
      </div>
    </header>
  );
};
