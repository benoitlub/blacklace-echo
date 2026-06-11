import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./styles/blacklace.css";
import "./styles/blacklace-video-fix.css";
import "./styles/feuch-modal-fix.css";
import "./styles/rotas-real-fix.css";
import Index from "./pages/Index.tsx";
import Map from "./pages/Map.tsx";
import Aloisia from "./pages/Aloisia.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function RouteRestorer() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const route = params.get("route");
    if (!route) return;
    params.delete("route");
    const query = params.toString();
    window.history.replaceState(null, "", route + (query ? `?${query}` : ""));
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/blacklace-echo">
        <RouteRestorer />
        <div className="bl-build-marker">ROTAS v1.1 // PLATEAU FINAL COMPOSÉ // HOTSPOTS OK</div>
        <div className="bl-build-footer">BUILD 2026-06-10 // IMAGE COMPOSÉE + CLICS POI</div>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/map" element={<Map />} />
          <Route path="/aloisia" element={<Aloisia />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
