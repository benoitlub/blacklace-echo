import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// GitHub Pages sends deep links through public/404.html. Restore them before the router mounts.
const route = new URLSearchParams(window.location.search).get("route");
const base = import.meta.env.BASE_URL;
if (route?.startsWith("/") && !route.startsWith("//")) {
  const destination = new URL(base + route.slice(1), window.location.origin);
  if (destination.origin === window.location.origin && destination.pathname.startsWith(base)) {
    window.history.replaceState(null, "", destination);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
