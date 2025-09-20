import { toast } from "sonner";

export const errPopper = (err: any) => {
  toast.dismiss();
  toast.error(err?.message || err?.data?.message || "Something went wrong");
  console.error(err);
};