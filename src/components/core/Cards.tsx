import * as React from "react";
import { ClipboardList, ListChecks, ListTodo, RefreshCw } from "lucide-react"; // default icons

interface BigCardProps {
  title: string;
  value?: number | string;
  icon?: React.ReactNode; // allow custom icon later
}

const cardConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
  "Total Tasks": {
    bg: "bg-purple-100",
    icon: <ClipboardList className="text-purple-500" size={28} />,
  },
  "Completed Tasks": {
    bg: "bg-blue-100",
    icon: <ListChecks className="text-blue-500" size={28} />,
  },
  "In Progress Task": {
    bg: "bg-orange-100",
    icon: <ListTodo className="text-orange-500" size={28} />,
  },
  "Pending Tasks": {
    bg: "bg-green-100",
    icon: <RefreshCw className="text-green-500" size={28} />,
  },
};

const BigCard = ({ title, value = 0, icon }: BigCardProps) => {
  const getConfig = (t: string) =>
    cardConfig[t] || {
      bg: "bg-gray-100",
      icon: <ClipboardList className="text-gray-500" size={28} />,
    };

  const { bg, icon: defaultIcon } = getConfig(title);

  return (
    <div
      className={`w-[215px] h-[110px] rounded-2xl shadow-sm flex items-center justify-between p-5 ${bg}`}
    >
      <div className="flex flex-col">
        <span className="text-sm text-gray-600">{title}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <div>{icon || defaultIcon}</div>
    </div>
  );
};
export default BigCard;
