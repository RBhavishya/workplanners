// app/client.tsx
import { createRouter } from "@/router";
import { StartClient } from "@tanstack/react-start";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

const router = createRouter();

hydrateRoot(
  document,
  <StartClient router={router} />
  // removed strict mode
);
