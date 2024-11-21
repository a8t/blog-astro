import React, { type ButtonHTMLAttributes } from "react";
import { useButton, type AriaButtonOptions } from "@react-aria/button";

export function ControlButton(
  props: AriaButtonOptions<"button"> & ButtonHTMLAttributes<HTMLButtonElement>,
) {
  let ref = React.useRef<HTMLButtonElement>(null);
  let { buttonProps } = useButton(props, ref);
  let { children } = props;

  return (
    <button {...buttonProps} ref={ref} className={props.className}>
      {children}
    </button>
  );
}
