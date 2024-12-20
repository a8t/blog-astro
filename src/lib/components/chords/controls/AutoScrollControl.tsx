import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaMinusCircle, FaStopCircle } from "react-icons/fa";
import { ControlButton } from "./ControlButton";

export function AutoScrollControl() {
  const [scrollAmount, setScrollMultiplier] = useState(0);
  const isStationary = scrollAmount === 0;

  const stopScroll = () => setScrollMultiplier(0);
  const increment = () => setScrollMultiplier(scrollAmount + 1);
  const decrement = () => setScrollMultiplier(scrollAmount - 1);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      window.scrollBy({
        top: scrollAmount,
        behavior: "smooth",
      });
    }, 60);

    if (isStationary) {
      clearInterval(scrollInterval);
    }

    return () => {
      clearInterval(scrollInterval);
    };
  }, [scrollAmount]);

  return (
    <div className="flex space-x-2 items-center">
      <span className="text-gray-500 text-sm">Autoscroll</span>
      <ControlButton onPress={stopScroll} disabled={isStationary}>
        <FaStopCircle className="w-8 h-8" />
      </ControlButton>
      <ControlButton onPress={decrement} disabled={isStationary}>
        <FaMinusCircle className="w-8 h-8" />
      </ControlButton>
      <div className="text-md w-6 text-center">{scrollAmount}</div>
      <ControlButton onPress={increment} disabled={scrollAmount > 19}>
        <FaPlusCircle className="w-8 h-8" />
      </ControlButton>
    </div>
  );
}
