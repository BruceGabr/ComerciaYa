import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const PageReadyContext = createContext();

export const PageReadyProvider = ({ children }) => {
  const [pageReady, setPageReadyState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef(null);
  const currentRouteRef = useRef(null);

  // ✅ Función para iniciar proceso de carga
  const startLoading = useCallback(() => {
    const currentPath = window.location.pathname;

    // Evitar reiniciar si ya está cargando la misma ruta
    if (isLoading && currentRouteRef.current === currentPath) {
      console.log('⏭️ PageReady: Ya cargando esta ruta, saltando');
      return;
    }

    console.log('🔄 PageReady: Iniciando carga para ruta:', currentPath);

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    currentRouteRef.current = currentPath;
    setIsLoading(true);
    setPageReadyState(false);
  }, [isLoading]);

  // ✅ Función para finalizar proceso de carga con delay mínimo
  const finishLoading = useCallback((customDelay = 200) => {
    console.log('⏳ PageReady: Finalizando carga...');

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.log('✅ PageReady: Carga completada');
      setIsLoading(false);
      setPageReadyState(true);
      timeoutRef.current = null;
    }, customDelay);
  }, []);

  // ✅ Función para resetear estado
  const resetPageState = useCallback(() => {
    console.log('🔄 PageReady: Reseteando estado');

    // Limpiar timeout si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsLoading(false);
    setPageReadyState(false);
    currentRouteRef.current = null;
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