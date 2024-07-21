export const storageKeys = {
  THEME: "THEME",
  PASSCODE: "CSIPRO_PASSCODE",
  FIREBASE_UID: "CSIPRO_FIREBASE_UID",
  SELECTED_ROOM: "CSIPRO_SELECTED_ROOM",
  SEEN_ONBOARDING: "CSIPRO_SEEN_ONBOARDING",
  BLE_AUTO_CONNECT: "CSIPRO_BLE_AUTO_CONNECT",
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
