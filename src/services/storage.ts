import AsyncStorage from '@react-native-async-storage/async-storage';

//Async section to read the stored or saved notes hhey
export async function readStored<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  return value === null ? null : JSON.parse(value);
}

//Function that allows you rro write or add the Notes or to b stored at the storage (Async storage)
export function writeStored<T>(key: string, value: T) {
  return AsyncStorage.setItem(key, JSON.stringify(value));
}
