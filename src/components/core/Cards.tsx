import * as React from "react";
import { ClipboardList, ListChecks, ListTodo, RefreshCw } from "lucide-react"; // default icons

interface BigCardProps {
  title: string;
  value?: any;
  icon?: React.ReactNode; // allow custom icon later
}

const cardConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
  "Total Tasks": {
    bg: "bg-[rgba(255,200,73,0.20)]",
    icon: <ClipboardList className="text-purple-500" size={20} />,
  },
  "Completed Tasks": {
    bg: "bg-sky-100",
    icon: <ListChecks className="text-blue-500" size={28} />,
  },
  "In Progress Task": {
    bg: "bg-red-50",
    icon: <ListTodo className="text-orange-500" size={28} />,
  },
  "Pending Tasks": {
    bg: "bg-emerald-50",
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
      className={`w-54 rounded-md shadow-none flex flex-col p-2 gap-3 ${bg}`}
    >
      <div>
        <span className="text-sm text-neutral-400">{title}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-medium">{value}</span>
        {icon || defaultIcon}
      </div>
    </div>
  );
};
export default BigCard;
