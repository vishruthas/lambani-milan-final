import { useEffect, useState } from "react";
import bg1 from "../assets/bg1.webp";
import bg2 from "../assets/bg2.webp";
import bg3 from "../assets/bg3.webp";
import bg4 from "../assets/bg4.webp";
import "./BackgroundSlider.css";

export default function BackgroundSlider() {
  const images = [bg1, bg2, bg3, bg4];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="bg-container" aria-hidden="true" role="presentation">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className={`bg-image ${i === index ? "active" : ""}`}
          draggable="false"
        />
      ))}
      <div className="bg-overlay" />
    </div>
  );
}
