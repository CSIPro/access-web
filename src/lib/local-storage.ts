export const storageKeys = {
  THEME: "THEME",
  PASSCODE: "CSIPRO_PASSCODE",
  FIREBASE_UID: "CSIPRO_FIREBASE_UID",
  LAST_UID: "CSIPRO_LAST_UID",
  SELECTED_ROOM: "CSIPRO_SELECTED_ROOM",
  SEEN_ONBOARDING: "CSIPRO_SEEN_ONBOARDING",
  BLE_AUTO_CONNECT: "CSIPRO_BLE_AUTO_CONNECT",
  BLE_AUTH_EXPIRATION: "CSIPRO_BLE_AUTH_EXPIRATION",
};

export const saveToStorage = (key: keyof typeof storageKeys, value: string) => {
  localStorage.setItem(key, value);
};

export const getFromStorage = (key: keyof typeof storageKeys) => {
  return localStorage.getItem(key);
};

export const deleteFromStorage = (key: keyof typeof storageKeys) => {
  localStorage.removeItem(key);
};
