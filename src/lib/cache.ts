import { getFromStorage, saveToStorage, storageKeys } from "./local-storage";

const cacheExpirationKeys: Partial<
  Record<keyof typeof storageKeys, keyof typeof storageKeys>
> = {
  ROOMS: "ROOMS_LAST_FETCHED",
  ROLES: "ROLES_LAST_FETCHED",
  USER: "USER_LAST_FETCHED",
  USER_ID: "USER_ID_LAST_FETCHED",
  USER_MEMBERSHIPS: "USER_MEMBERSHIPS_LAST_FETCHED",
};

export const saveToCache = <T>(
  key: keyof typeof storageKeys,
  data: Array<T> | T,
) => {
  try {
    saveToStorage(key, JSON.stringify(data));
    saveToStorage(cacheExpirationKeys[key]!, Date.now().toString());
  } catch (error) {
    console.error("Error saving data to cache", error);
  }
};

export const loadFromCache = (key: keyof typeof storageKeys) => {
  try {
    const cachedData = getFromStorage(key);

    if (!cachedData) {
      return undefined;
    }

    return JSON.parse(cachedData);
  } catch (error) {
    console.error("Error loading data from cache", error);

    return undefined;
  }
};
