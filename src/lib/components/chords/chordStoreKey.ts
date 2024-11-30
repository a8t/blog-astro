export interface ChordStoreKey {
  url: string;
}

export function getChordStoreKey(): ChordStoreKey {
  return { url: window.location.pathname };
}

export function stringifyKey(key: ChordStoreKey) {
  return key.url;
}
