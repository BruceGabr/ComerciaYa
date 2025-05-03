import React from "react";
import { AuthProvider } from "./context/AuthContext"; // Importamos el contexto
import Header from "./components/Header";
import Home from "./pages/Home";

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <Home />
      </div>
    </AuthProvider>
  );
}

export default App;
