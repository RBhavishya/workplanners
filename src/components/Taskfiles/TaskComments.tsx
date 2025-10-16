import { addChatsByIdAPI, getChatsByIdAPI } from "@/https/services/tasks";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Loader2, LoaderCircle, MessageSquareIcon, Send } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";

export function TaskComments() {
  const { id } = useParams({ strict: false });
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: chats, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["chats", id],
    queryFn: async ({ pageParam = 1 }) => {
        const queryParams = {
            page: pageParam,
            limit: 10,
        };
      const response = await getChatsByIdAPI(Number(id), queryParams);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination_info) return undefined;
      const { current_page, total_pages } = lastPage.pagination_info;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!id,
  });

  const chatRecords =  chats?.pages.flatMap((page) => page.records) || [];
  const total_records = chats?.pages[0]?.pagination_info?.total_records || 0;

  const addChatMutation = useMutation({
    mutationKey: ["addChats", id],
    mutationFn: async (newComment: string) => {
        const payload = {
            description: newComment,
            task_id: Number(id)
        }
        const response = await addChatsByIdAPI(payload);
        return response.data;
    },
    onSuccess: (newCommentDescription) => {
        queryClient.invalidateQueries({ queryKey: ["chats", id] });
  
      queryClient.setQueryData(["chats", id], (oldData: any) => {
        return {
          ...oldData,
          records: [...(oldData?.records || []), newCommentDescription],
        };
      });
    }, 
    onError: (error: any) => {
        toast.error(error.message);
      }
  })

  const handleChatSubmit = () => {
    if (comment) {
      addChatMutation.mutate(comment);
      setComment("");
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };
  const handleScroll = (e: any) => {
    const container = e.currentTarget as HTMLElement;
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      container.scrollTop + container.clientHeight >=
        container.scrollHeight - 20
    ) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (chatRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 py-10">
        <MessageSquareIcon size={40} className="mb-2 text-gray-400" />
        <p className="text-sm">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  let lastDate = "";

  return (
    <div className="flex flex-col bg-white rounded-lg p-4 pb-2">
      <div className="flex items-center gap-2">
        <MessageSquareIcon className="text-blue-700" />
        <span className="text-sm 3xl:!text-base font-medium text-[#000]">
          Comments{" "}
          <span className="bg-blue-600 text-white rounded-full px-3 ml-3 py-0 text-xs 3xl:!text-sm">
            {total_records || 0}
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-2 h-[calc(100vh-270px)] overflow-y-auto pb-2" onScroll={handleScroll}>
        {chatRecords.map((chat: any, index: number) => {
          const isLoggedUser = chat.user?.id === loggedInUser.id;
          const chatDate = dayjs(chat.created_at).format("DD-MM-YYYY");
          const showDate = chatDate !== lastDate;
          lastDate = chatDate;

          return (
            <div className="flex flex-col gap-2" key={index}>
              {showDate && (
                <p className="text-gray-400 text-xs 3xl:!text-sm text-center">
                  ---- {chatDate} ----
                </p>
              )}

              <div
                className={`flex flex-col w-1/2 p-2 rounded ${
                  isLoggedUser
                    ? "ml-auto bg-violet-50 items-end"
                    : "mr-auto bg-gray-100 items-start"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isLoggedUser ? (
                    <div className="flex flex-col items-end">
                    <div className="flex items-center justify-between">
                    <p className="text-[13px] text-black w-96 max-h-20 overflow-auto whitespace-pre-line break-words">
                    {chat.description.charAt(0).toUpperCase() +
                      chat.description.slice(1)}
                  </p>
                  <p className="text-[10px] text-black font-medium text-right">{dayjs(chat.created_at).format("hh:mm A")}</p>
                  </div>
                  </div>
                  ) : (
                    <div className="flex flex-col items-start">
                    <div className="flex gap-2">
                      <p className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs 3xl:!text-sm">
                        {chat.user.display_name.charAt(0).toUpperCase()}
                      </p>
                      {chat.user && (
                        <p className="capitalize text-sm 3xl:!text-base text-neutral-500 mb-1">
                          {chat.user.display_name}
                        </p>
                      )}
                      </div>
                    <div className="flex items-center justify-between">
                    <p className="text-[13px] text-black ml-8 w-88 max-h-20 overflow-auto whitespace-pre-line break-words ">
                    {chat.description.charAt(0).toUpperCase() +
                      chat.description.slice(1)}
                  </p>
                  <p className="text-[10px] text-black font-medium text-right">{dayjs(chat.created_at).format("hh:mm A")}</p>
                  </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isFetchingNextPage && (
            <div className="text-center py-2 text-gray-500">
              Loading more...
            </div>
          )}
      </div>
      <div className="relative w-full border rounded-sm">
      <Textarea
        placeholder="Add a comment..."
        className="w-205 h-10 p-2 placeholder:text-neutral-400 text-xs 3xl:!text-sm rounded resize-none pr-6 focus:ring-0 focus:outline-none border-none focus-visible:ring-0 break-words overflow-auto"
        value={comment}
        rows={3}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
        onClick={handleChatSubmit}
      />
          <Button
            type="button"
            className="absolute top-2 right-2 bg-blue-700 hover:bg-blue-800 rounded-full cursor-pointer"
          >
            {addChatMutation.isPending ? (
              <LoaderCircle className="text-white animate-spin w-5 h-5" />
            ) : (
              <Send className="!w-3.5 !h-3.5" />
            )}
          </Button>
        </div>
    </div>
  );
}
