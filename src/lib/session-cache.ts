import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  Query,
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import { del, get, set } from "idb-keyval";

import { firebaseAuth } from "@/firebase";

import {
  deleteFromStorage,
  getFromStorage,
  saveToStorage,
} from "./local-storage";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const PERSISTED_CLIENT_KEY = "access-web-query-cache";

/**
 * Keys the localStorage cache used before the query cache moved to IndexedDB.
 * The old helper stored each value under the name of its entry in
 * `storageKeys`, so these are the names, not the `CSIPRO_` values.
 */
const LEGACY_CACHE_KEYS = [
  "ROOMS",
  "ROOMS_LAST_FETCHED",
  "ROLES",
  "ROLES_LAST_FETCHED",
  "USER",
  "USER_LAST_FETCHED",
  "USER_ID",
  "USER_ID_LAST_FETCHED",
  "USER_MEMBERSHIPS",
  "USER_MEMBERSHIPS_LAST_FETCHED",
];

const removeLegacyCacheKeys = () => {
  LEGACY_CACHE_KEYS.forEach((key) => localStorage.removeItem(key));
};

interface AuthUser {
  uid: string;
}

export interface AuthLike {
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  signOut(): Promise<void>;
}

interface SessionCacheOptions {
  appVersion: string;
  auth: AuthLike;
  throttleTime?: number;
}

export const createSessionCache = ({
  appVersion,
  auth,
  throttleTime = 1000,
}: SessionCacheOptions) => {
  const getBuster = () => `${appVersion}:${getFromStorage("LAST_UID") ?? ""}`;

  // Once the persisted cache stops belonging to the signed-in user it must
  // not be restored, and nothing may be written to disk until a user is
  // signed in again.
  let restoreCancelled = false;
  let writesBlocked = false;

  removeLegacyCacheKeys();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        retry: false,
        gcTime: SEVEN_DAYS,
      },
    },
  });

  const persister = createAsyncStoragePersister({
    key: PERSISTED_CLIENT_KEY,
    throttleTime,
    storage: {
      getItem: async (key) => (await get<string>(key)) ?? null,
      setItem: async (key, value) => {
        if (writesBlocked) return;

        await set(key, value);
      },
      removeItem: (key) => del(key),
    },
    // The user can change during a session, so the buster is stamped when the
    // client is written instead of when it was created.
    serialize: (client) => JSON.stringify({ ...client, buster: getBuster() }),
  });

  const sessionPersister: typeof persister = {
    ...persister,
    restoreClient: async () => {
      const client = await persister.restoreClient();

      // Auth can resolve to another user while the read is still in flight.
      return restoreCancelled ? undefined : client;
    },
  };

  const persistOptions = {
    persister: sessionPersister,
    maxAge: SEVEN_DAYS,
    buster: getBuster(),
    dehydrateOptions: {
      shouldDehydrateQuery: (query: Query) =>
        defaultShouldDehydrateQuery(query) && query.meta?.persist !== false,
    },
  };

  const reconcile = async (user: AuthUser | null) => {
    if (user && user.uid === getFromStorage("LAST_UID")) {
      writesBlocked = false;
      return;
    }

    restoreCancelled = true;
    writesBlocked = true;
    queryClient.clear();

    try {
      await sessionPersister.removeClient();
    } finally {
      if (user) {
        saveToStorage("LAST_UID", user.uid);
        writesBlocked = false;
      }
    }
  };

  auth.onAuthStateChanged((user) => {
    void reconcile(user);
  });

  const signOut = async () => {
    writesBlocked = true;
    queryClient.clear();
    await sessionPersister.removeClient();
    removeLegacyCacheKeys();
    deleteFromStorage("LAST_UID");
    await auth.signOut();
  };

  return { queryClient, persistOptions, signOut };
};

export type SessionCache = ReturnType<typeof createSessionCache>;

let sessionCache: SessionCache | undefined;

export const getSessionCache = () => {
  sessionCache ??= createSessionCache({
    appVersion: APP_VERSION,
    auth: firebaseAuth,
  });

  return sessionCache;
};

export const signOut = () => getSessionCache().signOut();
