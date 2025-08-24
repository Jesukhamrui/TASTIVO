import React, { useState, useEffect } from "react";

function Imageslide({ slides }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slideStyles = {
    width: "100%",
    height: "100%",
    borderRadius: "10px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundImage: `url(${slides[currentIndex].url})`,
    position: "relative",
  };

  function goToPrevious() {
    setCurrentIndex(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
  }

  function goToNext() {
    setCurrentIndex(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
  }

  function goToSlide(slideIndex) {
    setCurrentIndex(slideIndex);
  }

  // Automatic sliding effect
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 3000); // Change slide every 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [currentIndex]); // Re-run effect when currentIndex changes

  return (
    <div className="sliderstyle">
      <div className="leftArrowStyles" onClick={goToPrevious}>
        ❰
      </div>
      <div className="rightArrowStyles" onClick={goToNext}>
        ❱
      </div>
      <div style={slideStyles}></div>
      <div className="dotsContainerStyles">
        {slides.map((slide, slideIndex) => (
          <div
            className="dotStyle"
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
          >
            ●
          </div>
        ))}
      </div>
    </div>
  );
}

export default Imageslide;