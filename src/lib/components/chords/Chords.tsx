import React from "react";
import { ControlButton } from "./controls/ControlButton";
import { useStore } from "@nanostores/react";
import { FaTimesCircle, FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import {
  makeIncrementForKey,
  makeDecrementForKey,
  makeResetForKey,
  chordStoreMap,
  getTransposeSemitones,
} from "./chordStore";

import { getChordStoreKey, stringifyKey } from "./chordStoreKey";
import { getConstantValue } from "typescript";

export function TransposeControl() {
  const chordStoreKey = getChordStoreKey();
  const chordStore = useStore(chordStoreMap);
  const currentSemitoneOffset = getTransposeSemitones(
    chordStoreKey,
    chordStore,
  );

  const isUnison = currentSemitoneOffset === 0;

  return (
    <div className="flex space-x-2 items-center mt-2">
      <span className="text-gray-500 text-sm">Transpose</span>

      <ControlButton
        onPress={makeResetForKey(chordStoreKey)}
        disabled={isUnison}
      >
        <FaTimesCircle className="w-8 h-8" />
      </ControlButton>

      <ControlButton onPress={makeDecrementForKey(chordStoreKey)}>
        <FaMinusCircle className="w-8 h-8" />
      </ControlButton>

      <div className="text-md w-6 text-center">{currentSemitoneOffset}</div>

      <ControlButton onPress={makeIncrementForKey(chordStoreKey)}>
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
