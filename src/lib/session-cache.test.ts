import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { clear, entries } from "idb-keyval";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { nestLogsQueryOptions } from "@/hooks/use-logs";
import { nestUserQueryOptions } from "@/hooks/use-user-data";

import { AuthLike, createSessionCache } from "./session-cache";

vi.mock("@/firebase", () => ({
  firebaseAuth: {
    currentUser: { uid: "auth-uid-1", getIdToken: async () => "id-token" },
  },
}));

const USER_PASSCODE = "9D9D1C";
const FAILED_ATTEMPT_PASSCODE = "3C3C2B";

const apiUser = {
  id: "user-1",
  firstName: "Ada",
  lastName: "Lovelace",
  passcode: USER_PASSCODE,
  csiId: 1234,
  unisonId: "219200000",
  authId: "auth-uid-1",
  dateOfBirth: "2000-01-01",
  isRoot: false,
  isEventOrganizer: false,
  notificationToken: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const apiLogs = [
  {
    id: "log-1",
    userId: null,
    roomId: "room-1",
    accessed: false,
    wireless: false,
    accessType: "keypad",
    attempt: { csiId: "4321", passcode: FAILED_ATTEMPT_PASSCODE },
    createdAt: "2024-01-01T10:00:00.000Z",
    user: null,
  },
  {
    id: "log-2",
    userId: "user-1",
    roomId: "room-1",
    accessed: true,
    wireless: true,
    accessType: "mobile",
    attempt: null,
    createdAt: "2024-01-01T11:00:00.000Z",
    user: {
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
      dateOfBirth: "2000-01-01",
    },
  },
];

const respondWithJson = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const stubApi = () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.includes("/users/find-one")) return respondWithJson(apiUser);
      if (url.includes("/access-logs/room/")) return respondWithJson(apiLogs);

      return new Response(null, { status: 404 });
    }),
  );
};

const createFakeAuth = () => {
  let listener: Parameters<AuthLike["onAuthStateChanged"]>[0] | undefined;

  return {
    onAuthStateChanged: (callback: typeof listener) => {
      listener = callback;

      return () => {};
    },
    signOut: vi.fn(async () => {}),
    emit: (user: { uid: string } | null) => listener?.(user),
  };
};

/** Starts the app the way the persist provider does: restore, then persist. */
const launchApp = async ({
  appVersion = "1.0.0",
  lastUid,
  authResolvesDuringRestore,
}: {
  appVersion?: string;
  lastUid?: string;
  /** The user Firebase Auth reports while the restore is still reading disk. */
  authResolvesDuringRestore?: { uid: string };
}) => {
  if (lastUid) {
    localStorage.setItem("LAST_UID", lastUid);
  }

  const auth = createFakeAuth();
  const cache = createSessionCache({ appVersion, auth, throttleTime: 0 });
  const [, restored] = persistQueryClient({
    queryClient: cache.queryClient,
    ...cache.persistOptions,
  });

  if (authResolvesDuringRestore) {
    auth.emit(authResolvesDuringRestore);
  }

  await restored;

  return { ...cache, auth };
};

/** Everything IndexedDB holds, as one string. */
const readDisk = async () =>
  (await entries())
    .map(([key, value]) => `${String(key)}=${JSON.stringify(value)}`)
    .join("\n");

const readLocalStorage = () =>
  Object.keys(localStorage)
    .map((key) => `${key}=${localStorage.getItem(key)}`)
    .join("\n");

const loadUserAndLogs = async (app: Awaited<ReturnType<typeof launchApp>>) => {
  await app.queryClient.fetchQuery(nestUserQueryOptions());
  await app.queryClient.fetchQuery(nestLogsQueryOptions("room-1", 40));
};

const waitForDiskToHold = (text: string) =>
  vi.waitFor(async () => expect(await readDisk()).toContain(text));

beforeEach(() => {
  stubApi();
});

afterEach(async () => {
  vi.unstubAllGlobals();
  localStorage.clear();
  await clear();
});

describe("session cache", () => {
  it("never writes a passcode to disk", async () => {
    const app = await launchApp({ lastUid: "auth-uid-1" });

    await loadUserAndLogs(app);
    await waitForDiskToHold("Lovelace");
    await waitForDiskToHold("4321");

    const stored = `${await readDisk()}\n${readLocalStorage()}`;

    expect(stored).not.toContain(USER_PASSCODE);
    expect(stored).not.toContain(FAILED_ATTEMPT_PASSCODE);
  });

  it("restores the cache for the same user and version", async () => {
    const first = await launchApp({ lastUid: "auth-uid-1" });
    await loadUserAndLogs(first);
    await waitForDiskToHold("Lovelace");
    await waitForDiskToHold("4321");

    const second = await launchApp({ lastUid: "auth-uid-1" });

    expect(
      second.queryClient.getQueryData(["user", "auth-uid-1"]),
    ).toMatchObject({ firstName: "Ada" });
    expect(
      second.queryClient.getQueryData(["logs", "room-1", 40]),
    ).toHaveLength(2);
  });

  it("does not restore a cache that belongs to another user", async () => {
    const first = await launchApp({ lastUid: "auth-uid-1" });
    await loadUserAndLogs(first);
    await waitForDiskToHold("Lovelace");

    const second = await launchApp({ lastUid: "auth-uid-2" });

    expect(second.queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it("clears the restored cache when auth resolves to a different user", async () => {
    const first = await launchApp({ lastUid: "auth-uid-1" });
    await loadUserAndLogs(first);
    await waitForDiskToHold("Lovelace");

    const second = await launchApp({ lastUid: "auth-uid-1" });
    expect(second.queryClient.getQueryCache().getAll()).not.toHaveLength(0);

    second.auth.emit({ uid: "auth-uid-2" });

    await vi.waitFor(async () => expect(await readDisk()).toBe(""));
    expect(second.queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(localStorage.getItem("LAST_UID")).toBe("auth-uid-2");
  });

  it("does not restore another user's cache when auth resolves first", async () => {
    const first = await launchApp({ lastUid: "auth-uid-1" });
    await loadUserAndLogs(first);
    await waitForDiskToHold("Lovelace");

    const second = await launchApp({
      lastUid: "auth-uid-1",
      authResolvesDuringRestore: { uid: "auth-uid-2" },
    });

    expect(second.queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it("clears the restored cache when auth resolves to no user", async () => {
    const first = await launchApp({ lastUid: "auth-uid-1" });
    await loadUserAndLogs(first);
    await waitForDiskToHold("Lovelace");

    const second = await launchApp({ lastUid: "auth-uid-1" });

    second.auth.emit(null);

    await vi.waitFor(async () => expect(await readDisk()).toBe(""));
    expect(second.queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it("does not restore a cache saved by another app version", async () => {
    const first = await launchApp({
      appVersion: "1.0.0",
      lastUid: "auth-uid-1",
    });
    await loadUserAndLogs(first);
    await waitForDiskToHold("Lovelace");

    const second = await launchApp({
      appVersion: "1.0.1",
      lastUid: "auth-uid-1",
    });

    expect(second.queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it("removes the legacy cache keys on startup and keeps the settings", async () => {
    localStorage.setItem("USER", JSON.stringify({ passcode: USER_PASSCODE }));
    localStorage.setItem("ROOMS", "[]");
    localStorage.setItem("ROOMS_LAST_FETCHED", "1700000000000");
    localStorage.setItem("SELECTED_ROOM", "room-1");
    localStorage.setItem("BLE_AUTO_CONNECT", "true");

    await launchApp({ lastUid: "auth-uid-1" });

    expect(localStorage.getItem("USER")).toBeNull();
    expect(localStorage.getItem("ROOMS")).toBeNull();
    expect(localStorage.getItem("ROOMS_LAST_FETCHED")).toBeNull();
    expect(localStorage.getItem("SELECTED_ROOM")).toBe("room-1");
    expect(localStorage.getItem("BLE_AUTO_CONNECT")).toBe("true");
  });

  it("leaves no cache behind after signing out", async () => {
    const app = await launchApp({ lastUid: "auth-uid-1" });
    await loadUserAndLogs(app);
    await waitForDiskToHold("Lovelace");
    localStorage.setItem("USER", "{}");
    localStorage.setItem("USER_MEMBERSHIPS", "[]");
    localStorage.setItem("SELECTED_ROOM", "room-1");
    localStorage.setItem("PASSCODE", "1A1A");
    localStorage.setItem("BLE_AUTO_CONNECT", "true");
    localStorage.setItem("BLE_AUTH_EXPIRATION", "1700000000000");

    await app.signOut();
    // Give a throttled write that was still pending time to land.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(await readDisk()).toBe("");
    expect(localStorage.getItem("USER")).toBeNull();
    expect(localStorage.getItem("USER_MEMBERSHIPS")).toBeNull();
    expect(localStorage.getItem("LAST_UID")).toBeNull();
    expect(localStorage.getItem("SELECTED_ROOM")).toBe("room-1");
    expect(localStorage.getItem("PASSCODE")).toBe("1A1A");
    expect(localStorage.getItem("BLE_AUTO_CONNECT")).toBe("true");
    expect(localStorage.getItem("BLE_AUTH_EXPIRATION")).toBe("1700000000000");
    expect(app.queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(app.auth.signOut).toHaveBeenCalledOnce();
  });
});
