export const storageKeys = {
  THEME: "THEME",
  PASSCODE: "CSIPRO_PASSCODE",
  USER_ID: "CSIPRO_USER_ID",
  USER_ID_LAST_FETCHED: "CSIPRO_USER_ID_LAST_FETCHED",
  FIREBASE_UID: "CSIPRO_FIREBASE_UID",
  SELECTED_ROOM: "CSIPRO_SELECTED_ROOM",
  SEEN_ONBOARDING: "CSIPRO_SEEN_ONBOARDING",
  BLE_AUTO_CONNECT: "CSIPRO_BLE_AUTO_CONNECT",
  BLE_AUTH_EXPIRATION: "CSIPRO_BLE_AUTH_EXPIRATION",
  ROOMS: "CSIPRO_ROOMS",
  ROOMS_LAST_FETCHED: "CSIPRO_ROOMS_LAST_FETCHED",
  ROLES: "CSIPRO_ROLES",
  ROLES_LAST_FETCHED: "CSIPRO_ROLES_LAST_FETCHED",
  USER: "CSIPRO_USER",
  USER_LAST_FETCHED: "CSIPRO_USER_LAST_FETCHED",
  USER_MEMBERSHIPS: "CSIPRO_USER_MEMBERSHIPS",
  USER_MEMBERSHIPS_LAST_FETCHED: "CSIPRO_USER_MEMBERSHIPS_LAST_FETCHED",
};

export const saveToStorage = (key: keyof typeof storageKeys, value: string) => {
  localStorage.setItem(key, value);
};

export const getFromStorage = (key: keyof typeof storageKeys) => {
  return localStorage.getItem(key);
};

export const deleteFromStorage = async (key: keyof typeof storageKeys) => {
  await localStorage.removeItem(key);
};

export const deleteAllFromStorage = () => {
  Object.keys(storageKeys).forEach((key) => {
    localStorage.removeItem(key);
  });
};
