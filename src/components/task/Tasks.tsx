import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  ClipboardList,
  ClipboardPenLine,
  FileClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BigCard from "../core/Cards";
import SmallCard from "../core/StatusCard";
import AddTaskForm from "./AddTask";


const Tasks = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-GB");
  const formattedDate = time.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="p-4">
      <div className="flex items-center mb-6 w-full">
        <div className="flex w-3/4 justify-center rounded gap-4">
          <SmallCard />
        </div>
        {/* divider */}
        <div className="h-10 w-px bg-gray-300 mx-6"></div>
        {/* top current time and date */}
        <div className="flex flex-col items-center w-1/4">
          <span className="text-lg font-semibold">{formattedTime}</span>
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
      </div>

      <hr />

      <div className="w-full p-4">
        <h1 className="flex text-bold text-2xl">Tasks</h1>
        <div className="flex gap-6 ">
          <div className="flex justify-around rounded gap-1 ml-10 mt-8">
            <div className="flex flex-wrap gap-4">
              <BigCard
                title="Total Tasks"
                value={29}
                icon={<ClipboardList />}
              />

              <BigCard
                title="In Progress Task"
                value={3}
                icon={<ClipboardPenLine />}
              />
              <BigCard title="Pending Tasks" value={1} icon={<FileClock />} />
            </div>
          </div>
          <div
            className=" bg-gray rounded-xl shadow-md p-4 w-120 h-40 "
            style={{ border: "1px solid  #ddb8ffff" }}
          ></div>
        </div>
      </div>
      <hr />
      <div className="mt-6">
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setOpen(true)}
        >
          + New Task
        </Button>
      </div>

      {/* Modal */}
      <AddTaskForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default Tasks;
