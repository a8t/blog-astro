import { persistentMap } from "@nanostores/persistent";
import { stringifyKey, type ChordStoreKey } from "./chordStoreKey";

export const chordStoreMap = persistentMap<Record<string, string>>(
  "chordStoreMap",
  {},
);

function setTransposeValueForKey(key: ChordStoreKey, value: number) {
  const current = chordStoreMap.get();
  chordStoreMap.set({
    ...current,
    [stringifyKey(key)]: value.toString() || "0",
  });
}

export function getTransposeSemitones(
  key: ChordStoreKey,
  sharedChordStoreMap: Record<string, string>,
) {
  const stringifiedKey = stringifyKey(key);
  const value = sharedChordStoreMap[stringifiedKey];

  return Number(value || 0) % 12;
}

export function makeIncrementForKey(key: ChordStoreKey) {
  const current = getTransposeSemitones(key, chordStoreMap.get());
  return () => setTransposeValueForKey(key, (current + 1) % 12);
}

export function makeDecrementForKey(key: ChordStoreKey) {
  const current = getTransposeSemitones(key, chordStoreMap.get());
  return () => setTransposeValueForKey(key, (current - 1) % 12);
}

export function makeResetForKey(key: ChordStoreKey) {
  return () => setTransposeValueForKey(key, 0);
}
