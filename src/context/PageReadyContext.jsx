import React, { createContext, useContext, useState, useCallback } from 'react';

const PageReadyContext = createContext();

export const PageReadyProvider = ({ children }) => {
  const [pageReady, setPageReadyState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Función para iniciar proceso de carga
  const startLoading = useCallback(() => {
    const currentPath = window.location.pathname;
    console.log('🔄 PageReady: Iniciando carga para ruta:', currentPath);
    setIsLoading(true);
    setPageReadyState(false);
  }, []);

  // ✅ Función para finalizar proceso de carga con delay mínimo
  const finishLoading = useCallback(() => {
    console.log('⏳ PageReady: Finalizando carga...');

    // Delay mínimo para asegurar render completo
    setTimeout(() => {
      console.log('✅ PageReady: Carga completada');
      setIsLoading(false);
      setPageReadyState(true);
    }, 50);
  }, []);

  // ✅ Función para resetear estado
  const resetPageState = useCallback(() => {
    console.log('🔄 PageReady: Reseteando estado');
    setIsLoading(false);
    setPageReadyState(false);
  }, []);

  return (
    <PageReadyContext.Provider value={{
      pageReady,
      isLoading,
      startLoading,
      finishLoading,
      resetPageState
    }}>
      {children}
    </PageReadyContext.Provider>
  );
};

export const usePageReady = () => {
  const context = useContext(PageReadyContext);
  if (!context) {
    throw new Error('usePageReady debe ser usado dentro de PageReadyProvider');
  }
  return context;
};