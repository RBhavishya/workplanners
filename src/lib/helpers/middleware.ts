import { redirect } from "@tanstack/react-router";

export function authMiddleware({ location }: { location: { pathname: string } }) {
  if (typeof window === "undefined") return; 

  const user = localStorage.getItem("user");

  if (!user && location.pathname !== "/") {
    throw redirect({ to: "/" });
  }

  if (user && location.pathname === "/") {
    throw redirect({ to: "/dashboard" });
  }
}
