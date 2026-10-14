import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

const root = document.getElementById("root");
if (!root) throw new Error("Dashboard root is missing.");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
