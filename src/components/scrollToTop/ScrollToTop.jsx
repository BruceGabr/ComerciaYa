import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll suave del window con un pequeño timeout para asegurar que se ejecute
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
      
      // También hacer scroll suave del contenedor principal si existe
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
      }
    }, 50);
    
  }, [pathname]);

  return null;
};

export default ScrollToTop;