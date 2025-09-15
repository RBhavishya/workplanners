interface StatusCardProps {
  title: string;
  value?: number;
  bg: string;
  circleBg: string;
  circleText: string;
  border: string;
}

const StatusCard = ({
  title,
  value = 0,
  bg,
  circleBg,
  circleText,
  border,
}: StatusCardProps) => {
  return (
    <div
      className={`flex items-center justify-between rounded-md p-1.5 px-3 gap-2 border ${border} ${bg}`}
    >
      <span className="text-xs 3xl:!text-sm font-medium text-gray-700">{title}</span>
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] 3xl:!text-sm font-light ${circleBg} ${circleText}`}
      >
        {value.toString().padStart(2, "0")}
      </div>
    </div>
  );
};

// Config for all card types
const statusConfig: Record<
  string,
  { bg: string; circleBg: string; circleText: string; border: string; }
> = {
  "Total Tasks": {
    bg: "bg-purple-200",
    border: "",
    circleBg: "bg-purple-600",
    circleText: "text-white",
  },
  "Completed Tasks": {
    bg: "bg-green-200",
    border: "",
    circleBg: "bg-green-600",
    circleText: "text-white",
  },
  "In Progress Task": {
    bg: "bg-blue-200",
    border: "",
    circleBg: "bg-blue-600",
    circleText: "text-white",
  },
  "Pending Tasks": {
    bg: "bg-yellow-200",
    border: "",
    circleBg: "bg-yellow-600",
    circleText: "text-white",
  },
  "Review Tasks": {
    bg: "bg-orange-200",
    border: "",
    circleBg: "bg-orange-600",
    circleText: "text-white",
  },

  TODAY: {
    bg: "bg-amber-200",
    border: "border-amber-300",
    circleBg: "bg-yellow-600",
    circleText: "text-amber-200",
  },
  OVERDUE: {
    bg: "bg-sky-200",
    border: "border-sky-500",
    circleBg: "bg-sky-600",
    circleText: "text-sky-200",
  },
  CLOSED: {
    bg: "bg-[rgba(255,116,134,0.60)]",
    border: "border-rose-400",
    circleBg: "bg-red-800",
    circleText: "text-red-300",
  },
};

interface SmallCardProps {
  cards: { title: string; value?: number }[];
}

const SmallCard = ({ cards }: SmallCardProps) => {
  return (
    <div className="flex gap-4 flex-wrap">
      {cards.map((card, index) => {
        const config = statusConfig[card.title] || {
          bg: "bg-gray-200",
          border: "border-gray-300",
          circleBg: "bg-gray-500",
          circleText: "text-white",
        };
        return <StatusCard key={index} {...card} {...config} />;
      })}
    </div>
  );
};

export default SmallCard;