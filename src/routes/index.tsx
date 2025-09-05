import { createFileRoute } from "@tanstack/react-router";
import { authMiddleware } from "../lib/helpers/middleware";
import Loginpage from "@/components/login/Login";

export const Route = createFileRoute("/")({
  beforeLoad: authMiddleware,
  component: Loginpage,
});
