import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext"; // ✅ Agregar
import { AppRouter } from "./routes/AppRouter";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider> {/* ✅ Agregar */}
        <AppRouter />
      </AuthProvider> {/* ✅ Agregar */}
    </QueryClientProvider>
  </React.StrictMode>
);