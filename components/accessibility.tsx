import React, { useEffect, useState } from 'react';

const Accessibility: React.FC = () => {
  const [fontSize, setFontSize] = useState(100); // percentual
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Aplicar estilos ao body
    document.documentElement.style.fontSize = `${fontSize}%`;
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [fontSize, highContrast]);

  const increaseFont = () => setFontSize(prev => Math.min(prev + 10, 200));
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 10, 70));
  const toggleContrast = () => setHighContrast(prev => !prev);

  return (
    <div className="accessibility-tools fixed top-4 right-4 z-50 flex gap-2">
      <button
        onClick={decreaseFont}
        className="accessibility-btn"
        aria-label="Diminuir fonte"
        title="Diminuir fonte"
      >
        <i className="fa-solid fa-minus"></i>
      </button>
      <button
        onClick={increaseFont}
        className="accessibility-btn"
        aria-label="Aumentar fonte"
        title="Aumentar fonte"
      >
        <i className="fa-solid fa-plus"></i>
      </button>
      <button
        onClick={toggleContrast}
        className="accessibility-btn"
        aria-label="Alto contraste"
        title="Alto contraste"
      >
        <i className="fa-solid fa-circle-half-stroke"></i>
      </button>
    </div>
  );
};

export default Accessibility;