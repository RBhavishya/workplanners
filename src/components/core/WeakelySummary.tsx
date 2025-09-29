import React from "react";

interface WeeklySummaryProps {
  data?: {
    productivity_percentage?: number;
    productive_tasks?: {
      count?: number;
      change_percentage?: number;
      is_increase?: boolean;
    };
    overdue_tasks?: {
      count?: number;
      change_percentage?: number;
      is_increase?: boolean;
    };
    total_tasks?: number;
  };
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ data: summary }) => {
  const productivity_percentage = summary?.productivity_percentage ?? 0;

  const productive = {
    count: summary?.productive_tasks?.count ?? 0,
    change_percentage: summary?.productive_tasks?.change_percentage ?? 0,
    is_increase: summary?.productive_tasks?.is_increase ?? false,
  };

  const overdue = {
    count: summary?.overdue_tasks?.count ?? 0,
    change_percentage: summary?.overdue_tasks?.change_percentage ?? 0,
    is_increase: summary?.overdue_tasks?.is_increase ?? false,
  };

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = productivity_percentage / 100;

  return (
    <div
      className=" bg-gray rounded-xl shadow-md p-2 w-120 h-30 "
      style={{ border: "1px solid #ddb8ff" }}
    >
      {/* Title */}
      <div className="text-sm font-medium text-gray-700 mb-2">
        Weekly Summary
      </div>

      <div className="flex items-center justify-between">
        {/* Progress Circle + Percentage */}
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#e5e5e5"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#8000ff"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-purple-600 font-semibold text-lg">
            {productivity_percentage}%
          </div>
        </div>

        {/* Productive */}
        <div className="flex flex-col items-center px-4 border-r border-gray-200">
          <span className="text-xs text-gray-500">Productive</span>
          <span className="text-gray-700 font-semibold text-lg">
            {productive.count}
          </span>
          <span
            className={`text-xs font-medium ${
              productive.is_increase ? "text-green-500" : "text-red-500"
            }`}
          >
            {productive.is_increase ? "▲" : "▼"} {productive.change_percentage}%
          </span>
        </div>

        {/* Overdue */}
        <div className="flex flex-col items-center px-4">
          <span className="text-xs text-gray-500">Overdue</span>
          <span className="text-gray-700 font-semibold text-lg">
            {overdue.count}
          </span>
          <span
            className={`text-xs font-medium ${
              overdue.is_increase ? "text-green-500" : "text-red-500"
            }`}
          >
            {overdue.is_increase ? "▲" : "▼"} {overdue.change_percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
