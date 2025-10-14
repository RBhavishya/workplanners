import React, { useEffect, useState } from "react";
import UserDetails from "../login/UserDetails";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { NotificationIcon } from "../icons/NotificationIcon";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  getAllNotificationsAPI,
  markAsReadAPI,
} from "@/https/services/notifications";
import { tr } from "date-fns/locale";

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
  const navigate = useNavigate({ from: "/" });
  const searchParams = new URLSearchParams(location.search);
  const pageIndexParam = Number(searchParams.get("current_page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 10;

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsData, setNotificationsData] = useState<any[]>([]);
  const [isNotificationsLoading, setIsNotificationLoading] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState<any>({
    total_records: 0,
    total_pages: 1,
    page_size: pageSizeParam,
    current_page: pageIndexParam,
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

  const getAllNotifications = async (page = 1) => {
    try {
      const response = await getAllNotificationsAPI({
        current_page: page,
        page_size: paginationInfo.page_size,
      });

      if (response?.status === 200 || response?.status === 201) {
        const { records, pagination_records } = response.data.data || {};

        if (Array.isArray(records)) {
          setNotificationsData((prev: any[]) =>
            page === 1 ? records : [...prev, ...records]
          );
          setPaginationInfo(pagination_records);
          setNotificationCounts(pagination_records?.total_records || 0);
        } else {
          setNotificationsData([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const markAsRead = async (id: any) => {
    try {
      const response = await markAsReadAPI(id);
      if (response?.status === 200 || response?.status === 201) {
        // toast.success(response?.data?.message);
        setNotificationsData((prev = []) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, is_marked: true }
              : notification
          )
        );
        setIsNotificationsOpen(false);
        // getAllNotificationsCount();
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handlePopoverToggle = () => {
    setIsNotificationsOpen((prev) => !prev);
    if (!isNotificationsOpen) {
      setNotificationsData([]);
      getAllNotifications(1);
    }
  };

  const handleNotificationsScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      event.currentTarget.scrollHeight <=
      event.currentTarget.scrollTop + event.currentTarget.clientHeight + 50;

    if (
      bottom &&
      !isPaginationLoading &&
      paginationInfo.current_page < paginationInfo.total_pages
    ) {
      setIsPaginationLoading(true);
      getAllNotifications(paginationInfo.current_page + 1).finally(() =>
        setIsPaginationLoading(false)
      );
    }
  };

  //  useEffect(() => {
  //   // const socket = io("https://dev-api-tm.labsquire.com/", {
  //   //   transports: ["polling", "websocket"],
  //   // });
  //   const socket = io(import.meta.env.VITE_SOCKET_URL, {
  //     transports: ["polling", "websocket"],
  //   });

  //   socket.on("connect", () => {
  //     console.log("Connected to echo server");
  //   });
  //   socket.on("notification", (count) => {
  //     setNotificationCount(count);
  //     // getAllNotificationsCount();
  //     // getAllNotifications();
  //   });
  //   return () => {
  //     socket.off("notification");
  //   };
  // }, []);

  return (
    <header className="flex items-center justify-between p-2 bg-white border-b">
      {centerContent}
      <div className="flex items-center justify-end w-full">
        <div className="flex items-center space-x-6">
          <Popover
            open={isNotificationsOpen}
            onOpenChange={setIsNotificationsOpen}
          >
            <PopoverTrigger asChild>
              <div
                className="relative cursor-pointer"
                onClick={handlePopoverToggle}
              >
                <NotificationIcon className="h-8 w-8" />
                {notificationCounts > 0 && (
                  <span className="absolute top-0 right-[-10px] text-xs bg-red-500 text-white rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center">
                    {notificationCounts}
                  </span>
                )}
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-[420px] bg-white p-3 shadow-md rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">
                  Notifications ({notificationCounts || 0})
                </h3>
                {notificationsData?.length > 0 && notificationCounts > 0 && (
                  <button
                    className="text-blue-500 text-xs font-semibold hover:underline"
                    onClick={() => {
                      // markAsReadAll();
                    }}
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              {isNotificationsLoading ? (
                <p className="text-center">Loading...</p>
              ) : notificationsData?.length > 0 ? (
                <div
                  className="flex flex-col rounded-md max-h-[500px] h-[500px] min-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200"
                  onScroll={handleNotificationsScroll}
                >
                  <ul>
                    {notificationsData.map((notification: any) => (
                      <li
                        key={notification.id}
                        className="py-2 border-b last:border-none cursor-pointer hover:bg-gray-100 rounded-none px-2"
                        onClick={() => {
                          if (notification.is_marked === false) {
                            markAsRead(notification.id);
                          }

                          // Navigation logic based on notification category
                          if (
                            notification?.category === "task" ||
                            notification?.category === 1
                          ) {
                            navigate({
                              to: `/tasks/view/${notification.task_id}`,
                            });
                          } else if (
                            notification?.category === "project" ||
                            notification?.category === 2
                          ) {
                            navigate({
                              to: `/projects/${notification.project_id}`,
                            });
                          } else {
                            navigate({ to: `/view-profile` });
                          }

                          setIsNotificationsOpen(false);
                        }}
                      >
                        <p
                          className={`${
                            notification.is_marked === false
                              ? "font-semibold text-gray-900"
                              : "font-normal text-gray-700"
                          }`}
                        >
                          {/* {notification.title || "-"} */}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notification.description || "-"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.created_at
                            ? new Date(notification.created_at).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )
                            : "--"}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {paginationInfo.current_page < paginationInfo.total_pages && (
                    <div className="text-center text-xs text-gray-500 mt-2">
                      Loading more notifications...
                    </div>
                  )}
                </div>
              ) : (
                <p>No notifications available</p>
              )}
            </PopoverContent>
          </Popover>

          {/* User details */}
          <UserDetails />
        </div>
      </div>
    </header>
  );
};

export default Header;
