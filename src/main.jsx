import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { PageReadyProvider } from "./context/PageReadyContext";

// 👇 IMPORTA LOS CONTEXTOS AQUÍ
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/ComerciaYa">
      <AuthProvider>
        <PageReadyProvider>
          <App />
        </PageReadyProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
