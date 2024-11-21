import React, { useState, useRef, useCallback, useEffect } from "react";
import classNames from "classnames";
import { useWindowSize, useOnClickOutside } from "usehooks-ts";
import { FaTimes, FaCogs } from "react-icons/fa";
import { ControlButton } from "./ControlButton";

export function ControlMenu({ children }: React.PropsWithChildren<{}>) {
  // if the window size changes, re-render
  useWindowSize();

  const [isOpen, setIsOpen] = useState(true);

  const containerRef = useRef(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const isCogButtonVisible = buttonRef?.current?.offsetParent; // https://stackoverflow.com/a/21696585

  const maybeCloseWhenClickingOutsideContainer = useCallback(() => {
    if (isCogButtonVisible) {
      setIsOpen(false);
    }
  }, [isCogButtonVisible]);

  // close the container when clicking outside of it
  // but only if the button to re-open it is visible
  useOnClickOutside(containerRef, maybeCloseWhenClickingOutsideContainer);

  // if the container is closed but we extend the screen thereby hiding the button,
  // open the container
  useEffect(() => {
    if (!isCogButtonVisible) {
      setIsOpen(true);
    }
  }, [isCogButtonVisible]);

  return (
    <>
      <div
        ref={containerRef}
        className={classNames(
          "fixed right-4 bottom-4 sm:right-11 sm:bottom-11",
          "flex flex-col space-y-2 items-end",
          "border-2 border-gray-200 border-opacity-50 lg:border-none rounded-md",
          "px-4 sm:px-8 pt-2 sm:pt-4 pb-8 lg:pb-6 bg-gray-100 shadow-2xl  lg:shadow-none ",
          "z-20",
          { hidden: !isOpen },
        )}
      >
        <ControlButton className="lg:hidden" onClick={() => setIsOpen(false)}>
          <FaTimes className="w-3 h-3 absolute bottom-3 right-3 text-gray-400" />
        </ControlButton>
        {children}
      </div>
      <ControlButton
        className={classNames(
          "fixed right-4 bottom-4 sm:right-11 sm:bottom-11",
          "flex flex-col space-y-2 items-end",
          "p-4 bg-gray-50 shadow-md",
          "lg:hidden",
        )}
        onPress={() => setIsOpen(true)}
      >
        <div ref={buttonRef}>
          <FaCogs className="w-8 h-8 text-gray-400" />
        </div>
      </ControlButton>
    </>
  );
}
