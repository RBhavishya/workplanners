import * as React from "react";

interface StatusCardProps {
  title: string;
  value: number;
  bg: string;
  circleBg: string;
  circleText: string;
}

const statusConfig: Record<
  string,
  { bg: string; circleBg: string; circleText: string }
> = {
  TODAY: {
    bg: "bg-yellow-200",
    circleBg: "bg-yellow-600",
    circleText: "text-white",
  },
  OVERDUE: {
    bg: "bg-blue-200",
    circleBg: "bg-blue-600",
    circleText: "text-white",
  },
  CLOSED: {
    bg: "bg-red-300",
    circleBg: "bg-red-700",
    circleText: "text-white",
  },
};

const statusCards: { title: string; value: number }[] = [
  { title: "TODAY", value: 5 },
  { title: "OVERDUE", value: 3 },
  { title: "CLOSED", value: 3 },
];

const StatusCard = ({
  title,
  value,
  bg,
  circleBg,
  circleText,
}: StatusCardProps) => {
  return (
    <div
      className={`flex items-center justify-between w-[120px] h-[50px] rounded-xl px-4 ${bg}`}
    >
      <span className="text-sm font-semibold text-gray-700">{title}</span>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${circleBg} ${circleText}`}
      >
        {value.toString().padStart(2, "0")}
      </div>
    </div>
  );
};

const SmallCard = () => {
  return (
    <div className="flex gap-4 flex-wrap">
      {statusCards.map((card, index) => {
        const config = statusConfig[card.title] || {
          bg: "bg-gray-200",
          circleBg: "bg-gray-500",
          circleText: "text-white",
        };

        return <StatusCard key={index} {...card} {...config} />;
      })}
    </div>
  );
};

export default SmallCard;
