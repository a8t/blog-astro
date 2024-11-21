import React from "react";
import { ControlButton } from "./controls/ControlButton";
import { FaTimesCircle, FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import {
  transposeSemitones,
  decrementTransposeSemitones,
  incrementTransposeSemitones,
  resetTransposeSemitones,
} from "./chordStore";

import { useStore } from "@nanostores/react";

export function TransposeControl() {
  const $currentSemitoneOffset = useStore(transposeSemitones);
  const isUnison = $currentSemitoneOffset === 0;

  return (
    <div className="flex space-x-2 items-center mt-2">
      <span className="text-gray-500 text-sm">Transpose</span>

      <ControlButton onPress={resetTransposeSemitones} disabled={isUnison}>
        <FaTimesCircle className="w-8 h-8" />
      </ControlButton>

      <ControlButton onPress={decrementTransposeSemitones}>
        <FaMinusCircle className="w-8 h-8" />
      </ControlButton>

      <div className="text-md w-6 text-center">{$currentSemitoneOffset}</div>

      <ControlButton onPress={incrementTransposeSemitones}>
        <FaPlusCircle className="w-8 h-8" />
      </ControlButton>
    </div>
  );
}

export function Lyrics({ children }: React.PropsWithChildren<{}>) {
  return (
    <span
      className="
        block font-mono 
        text-xs
        sm:text-md
      "
    >
      {children}
    </span>
  );
}

export function Section({ children }: React.PropsWithChildren<{}>) {
  return (
    <span className="block font-mono mt-12 text-xl text-gray-900">
      {children}
    </span>
  );
}
