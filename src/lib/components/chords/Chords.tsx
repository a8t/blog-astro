import React, { useContext, useState } from "react";
import { Chord, Interval } from "tonal";
import { ControlButton } from "./controls/ControlButton";
import { FaTimesCircle, FaMinusCircle, FaPlusCircle } from "react-icons/fa";

const TransposeContext = React.createContext({
  semitones: 0,
  reset: () => {},
  increment: () => {},
  decrement: () => {},
});

const useTransposeContext = () => useContext(TransposeContext);

export function TransposeProvider({ children }: React.PropsWithChildren<{}>) {
  const [semitones, setSemitones] = useState(0);
  const reset = () => setSemitones(0);
  const increment = () => setSemitones((semitones + 1) % 12);
  const decrement = () => setSemitones((semitones - 1) % 12);
  console.log({ semitones });
  return (
    <TransposeContext.Provider
      value={{ semitones, reset, increment, decrement }}
    >
      {children}
    </TransposeContext.Provider>
  );
}

export function TransposeControl() {
  const { semitones, reset, increment, decrement } = useTransposeContext();
  const isUnison = semitones === 0;

  return (
    <div className="flex space-x-2 items-center">
      <span className="text-gray-500 text-sm">Transpose</span>

      <ControlButton onPress={reset} disabled={isUnison}>
        <FaTimesCircle className="w-8 h-8" />
      </ControlButton>
      <ControlButton onPress={decrement}>
        <FaMinusCircle className="w-8 h-8" />
      </ControlButton>
      <div className="text-md w-6 text-center">{semitones}</div>
      <ControlButton onPress={increment}>
        <FaPlusCircle className="w-8 h-8" />
      </ControlButton>
    </div>
  );
}

export function Chords({ children }: { children: React.ReactElement }) {
  const { semitones } = useTransposeContext();

  const chords = children.props.value
    .toString()
    .replace(/\w+/g, (chord: string) =>
      Chord.transpose(chord, Interval.fromSemitones(semitones)),
    );

  return (
    <span
      className="
        block font-mono whitespace-pre text-green-700 
        mt-2 text-xs
        sm:mt-4 sm:text-md
      "
    >
      {chords}
    </span>
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
