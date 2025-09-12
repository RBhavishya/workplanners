import React, { useState, useRef } from "react";
import {
  Calendar as CalendarPicker,
  Check,
  CheckCircle,
  ChevronDown,
  MoveLeft,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

// Utility to format dates
const formatDate = (date: Date) => dayjs(date).format("DD/MM/YYYY");

const AddTaskForm = () => {
  // Local states
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");

  // Mock users API response
  const usersResp = {
    data: {
      data: [
        { id: 1, display_name: "Alice" },
        { id: 2, display_name: "Bob" },
        { id: 3, display_name: "Charlie" },
      ],
    },
  };
  const isLoading = false;

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const triggerWidth = triggerRef.current?.offsetWidth;

  // Error placeholder
  const errors: Record<string, string[]> = {};

  // Handlers
  const toggleUser = (id: number) => {
    setAssignedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const removeUser = (id: number) => {
    setAssignedUsers((prev) => prev.filter((u) => u !== id));
  };

  const removeAll = () => {
    setAssignedUsers([]);
  };

  const handleAddLink = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && linkInput.trim() !== "") {
      e.preventDefault();
      setLinks((prev) => [...prev, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNavigation = () => {
    console.log("Back navigation");
  };

  const handleSave = () => {
    if (!title || !description || !startDate || !dueDate) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormError("");
    setSuccessMessage("Project saved successfully!");
    console.log({
      title,
      description,
      startDate,
      dueDate,
      assignedUsers,
      links,
    });
  };

  return (
    <div className="mt-6 ml-62 p-6 bg-white shadow rounded-xl border max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-start gap-3 mb-4">
        <button
          onClick={handleNavigation}
          className="px-2 py-2 text-gray-600 rounded cursor-pointer"
        >
          <MoveLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {mode === "edit" ? "Edit Project" : "Add Project"}
        </h2>
      </div>

      {/* Errors */}
      {formError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {formError}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">
          Project Description <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Enter Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Dates */}
      <div className="flex gap-4 mb-4">
        {/* Start Date */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-medium">
            Start Date <span className="text-red-500">*</span>
          </label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "w-full flex items-center gap-2 border rounded-lg p-2 text-sm cursor-pointer hover:bg-gray-50",
                  !startDate && "text-muted-foreground"
                )}
                onClick={() => setStartDateOpen(true)}
              >
                <CalendarPicker className="h-4 w-4 text-gray-500" />
                {startDate ? formatDate(startDate) : "Pick a date"}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarPicker
                mode="single"
                // selected={startDate}
                // onSelect={(date: Date | undefined) => {
                //   setStartDate(date);
                //   setStartDateOpen(false);
                //   if (date && dueDate && dayjs(dueDate).isBefore(dayjs(date))) {
                //     setDueDate(undefined);
                //   }
                // }}
                className="rounded-md border bg-white shadow-sm"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-medium">
            Due Date <span className="text-red-500">*</span>
          </label>
          <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "w-full flex items-center gap-2 border rounded-lg p-2 text-sm cursor-pointer hover:bg-gray-50",
                  !dueDate && "text-muted-foreground",
                  !startDate && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => startDate && setDueDateOpen(true)}
              >
                <CalendarPicker className="h-4 w-4 text-gray-500" />
                {dueDate ? formatDate(dueDate) : "Pick a due date"}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarPicker
                mode="single"
                // selected={dueDate}
                // onSelect={(date: Date | undefined) => {
                //   setDueDate(date);
                //   setDueDateOpen(false);
                // }}
                className="rounded-md border bg-white shadow-sm"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Assign Users (only create mode) */}
      {mode === "create" && (
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-medium">Select Projects</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div
                ref={triggerRef}
                className="rounded border flex items-center justify-between px-2 py-2 cursor-pointer"
              >
                <div className="flex flex-wrap gap-1">
                  {assignedUsers.length === 0 ? (
                    <span className="text-gray-400">Select Projects...</span>
                  ) : (
                    assignedUsers.map((id) => {
                      const user = usersResp.data.data.find((u) => u.id === id);
                      return (
                        <div
                          key={id}
                          className="flex items-center px-2 py-1 rounded bg-purple-100 text-sm gap-1"
                        >
                          <span>{user?.display_name ?? `User ${id}`}</span>
                          <button onClick={() => removeUser(id)}>
                            <X className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {assignedUsers.length > 0 && (
                    <button type="button" onClick={removeAll}>
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                  <ChevronDown />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent
              style={{ width: triggerWidth ? `${triggerWidth}px` : "auto" }}
              className="p-0"
            >
              <Command>
                <CommandInput
                  placeholder="Search users..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList className="max-h-60 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-2 text-gray-500">Loading...</div>
                  ) : usersResp.data.data.length === 0 ? (
                    <CommandEmpty>No users found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {usersResp.data.data.map((u) => (
                        <CommandItem
                          key={u.id}
                          onSelect={() => toggleUser(u.id)}
                        >
                          <span>{u.display_name}</span>
                          <Check
                            className={cn(
                              "h-4 w-4 ml-auto",
                              assignedUsers.includes(u.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Reference Links */}
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">Project Reference Links</label>
        <div className="border rounded-lg p-2 flex flex-wrap gap-2 min-h-[48px]">
          {links.map((link, index) => (
            <span
              key={index}
              className="flex items-center gap-2 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm"
            >
              {link}
              <button
                type="button"
                className="text-xs text-purple-500 hover:text-purple-700"
                onClick={() => handleRemoveLink(index)}
              >
                ✕
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add a link and press Enter"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={handleAddLink}
            className="flex-1 outline-none bg-transparent text-sm"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleNavigation}
          className="px-4 py-2 border rounded-lg text-purple-500 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddTaskForm;
