import { atom } from "nanostores";

export const transposeSemitones = atom(0);

export function incrementTransposeSemitones() {
  transposeSemitones.set(transposeSemitones.get() + 1);
}

export function decrementTransposeSemitones() {
  transposeSemitones.set(transposeSemitones.get() - 1);
}

export function resetTransposeSemitones() {
  transposeSemitones.set(0);
}
