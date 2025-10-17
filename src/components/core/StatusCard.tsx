interface StatusCardProps {
  title: string;
  value?: number; // optional → defaults to 0
  bg: string;
  circleBg: string;
  circleText: string;
}

const StatusCard = ({
  title,
  value = 0,
  bg,
  circleBg,
  circleText,
}: StatusCardProps) => {
  return (
    <div
      className={`flex items-center justify-between w-[145px] h-[60px] rounded-md px-2 ${bg}`}
    >
      <span className="text-sm font-semibold text-gray-700">{title}</span>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-normal ${circleBg} ${circleText}`}
      >
        {value.toString().padStart(2, "0")}
      </div>
    </div>
  );
};

// Config for all card types
const statusConfig: Record<
  string,
  { bg: string; circleBg: string; circleText: string }
> = {
  "Total" : {
    bg: "bg-pink-100",
    circleBg: "bg-rose-400",
    circleText: "text-white",
  },
  "Todo": {
    bg: "bg-purple-100",
    circleBg: "bg-purple-600",
    circleText: "text-white",
  },
  "Completed": {
    bg: "bg-green-100",
    circleBg: "bg-green-600",
    circleText: "text-white",
  },
  "In Progress": {
    bg: "bg-blue-100",
    circleBg: "bg-blue-600",
    circleText: "text-white",
  },
  "Review": {
    bg: "bg-yellow-100",
    circleBg: "bg-yellow-600",
    circleText: "text-white",
  },
  "Overdue": {
    bg: "bg-orange-100",
    circleBg: "bg-orange-600",
    circleText: "text-white",
  },

  TODAY: {
    bg: "bg-pink-100",
    circleBg: "bg-pink-600",
    circleText: "text-white",
  },
  OVERDUE: {
    bg: "bg-red-100",
    circleBg: "bg-red-600",
    circleText: "text-white",
  },
  CLOSED: {
    bg: "bg-gray-100",
    circleBg: "bg-gray-700",
    circleText: "text-white",
  },
};

interface SmallCardProps {
  cards: { title: string; value?: number }[];
}

const SmallCard = ({ cards }: SmallCardProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {cards.map((card, index) => {
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