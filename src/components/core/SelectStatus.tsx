import { Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { statuses } from "@/lib/helpers/StatusFilter";
import { Button } from "../ui/button";

export const SelectStatus = ({ selectedStatus, handleStatusChange }) => {
  return (
    <div className="relative inline-block">
      <Select value={selectedStatus || ''} onValueChange={handleStatusChange}>
        <SelectTrigger className="flex items-center gap-2 bg-white border p-1 rounded-sm cursor-pointer text-sm !h-8 shadow-none focus-visible:ring-0 pr-5">
          <div className="flex items-center gap-1">
            <Filter className="text-purple-500" size={16} />
            <SelectValue placeholder="Select Status" />
          </div>
        </SelectTrigger>

        <SelectContent
          className="max-w-38 border rounded-md shadow-md mx-auto"
          align="center"
        >
          {statuses.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer hover:bg-gray-100 text-sm p-1"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedStatus && (
        <Button
          type="button"
          onClick={() => handleStatusChange("")}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded flex items-center justify-center text-gray-400 hover:text-red-500 p-0 bg-transparent hover:bg-transparent shadow-none"
          aria-label="Clear status"
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
};
