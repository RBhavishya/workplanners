import { Input } from "@/components/ui/input";
import { IReportsFilters } from "@/interfaces";


import { Search } from "lucide-react";

const TaskSearchFilter: React.FC<IReportsFilters> = ({
  searchString,
  setSearchString,
  title,
}) => {
  return (
    <div className="relative h-[35px]">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2  bg-red-700 text-white rounded-full w-[20px] h-[20px] p-1" />
      <Input
        placeholder={title}
        value={searchString}
        type="search"
        onChange={(e) => setSearchString(e.target.value)}
        className="pl-8bg-slate-100 pl-9 bg-[#F4F4F6] border-[#E2E2E2] rounded-[8px] h-[35px] w-[220px] placeholder:text-[#00000099]"
      />
    </div>
  );
};

export default TaskSearchFilter;
