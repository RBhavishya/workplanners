import { Input } from "@/components/ui/input";
import { IReportsFilters } from "@/interfaces";
import { SearchIcon } from "../icons/SearchIcon";

const SearchFilter: React.FC<IReportsFilters> = ({
  searchString,
  setSearchString,
  title,
}) => {
  return (
    <div className="relative w-65 h-7 border border-[#D1D1D1] bg-[#F6F6F6] rounded-sm shadow-none flex items-center px-2">
       <SearchIcon className="w-4.5 h-4.5 3xl:!w-5 3xl:!h-5 text-gray-500" />
      <Input
        type="search"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        placeholder={title}
        className="pl-2 h-full w-full border-none rounded text-black font-normal text-sm 3xl:!text-base shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-sm"
      />
      {/* <span className="absolute right-3 top-1/2 -translate-y-1/2">
        <SearchIcon className="w-4.5 h-4.5 text-gray-500" />
      </span> */}
    </div>
  );
};

export default SearchFilter;
