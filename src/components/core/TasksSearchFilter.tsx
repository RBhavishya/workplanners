import { Input } from "@/components/ui/input";
import { IReportsFilters } from "@/interfaces";
import { SearchIcon } from "../icons/SearchIcon";
import { Search } from "lucide-react";

const TaskSearchFilter: React.FC<IReportsFilters> = ({
  searchString,
  setSearchString,
  title,
}) => {
  return (
    <div className="relative w-60 h-8 border border-[#D1D1D1] bg-white rounded-sm shadow-none flex items-center px-2">
      <Input
        type="search"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        placeholder={title}
        className="px-6 h-full w-full border-none rounded text-black font-normal text-sm 3xl:!text-base shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-sm"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2">
        <Search className="w-4 h-4 text-violet-600" strokeWidth={3}/>
      </span>
    </div>
  );
};

export default TaskSearchFilter;
