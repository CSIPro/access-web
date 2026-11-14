# Persist the query cache in IndexedDB, keyed by app version and user

Status: accepted

## Context

Most people run Access Web as a home-screen app on an iPhone. iOS ends those apps often, so most launches start with an empty in-memory cache and every screen shows a spinner until the API answers. With a weak signal the app shows "No fue posible conectar con el servidor" for data the phone showed minutes earlier.

Before this change only the user, rooms, roles and memberships were cached, each by hand-written code in its own hook, in localStorage. That cache stored the user's passcode in plain text.

## Decision

Persist the whole TanStack Query cache to IndexedDB through an async persister (idb-keyval), and restore it on launch.

- **Key.** The persisted client carries the buster `${APP_VERSION}:${uid}`. A cache written by another app version or another user is discarded on restore. The uid comes from `LAST_UID`, a synchronous localStorage key written whenever Firebase Auth reports a signed-in user, so restore never waits on Firebase Auth. When Auth later resolves to a different uid, or to no user, the in-memory cache and the persisted client are cleared.
- **Lifetime.** Queries stay in memory for 7 days (`gcTime`) and a persisted client older than 7 days is discarded (`maxAge`). Writes are throttled to one per second.
- **Scope.** Every successful query is persisted. A query opts out with `meta: { persist: false }`.
- **Passcodes never enter the cache.** The user query function removes `passcode` from the user, and the logs query function removes `attempt.passcode` from every log. The data that reaches the cache, and so the disk, never contains them. The UI never read either field. The API should stop sending them, which is tracked separately.
- **Cached data over error screens.** Every screen and provider that renders from a query checks for data first and shows a full error state only when there is none. Since TanStack Query v5 keeps the previous data when a refetch fails, a restored cache stays visible when the refresh fails.
- **One sign-out function.** It clears the query client, removes the persisted client, removes the legacy cache keys and `LAST_UID`, then signs out of Firebase. Every place that signs out calls it.

## Alternatives considered

- **localStorage.** It is synchronous and simple, but it holds about 5 MB, blocks the main thread on large writes, and the persisted logs and member lists can outgrow it. IndexedDB has no such limit and is the storage the persister library expects.
- **An allowlist of queries to persist.** It avoids storing data by accident, but each new query would need an entry, and forgetting one brings back the spinner this change removes. Persisting everything with an opt-out, and stripping the sensitive fields at parse time, keeps the default safe and the list empty.
- **Gating restore on Firebase Auth.** Waiting for Auth to resolve the uid before restoring would make the buster exact, but Auth startup is the slow step this change works around. `LAST_UID` gives the buster synchronously, and reconciliation covers the case where it turns out to be wrong.

## Consequences

- The first launch after this ships is one cold load per user, because the old localStorage cache is deleted instead of migrated.
- Installed iOS home-screen apps are exempt from Safari's 7-day script storage eviction, so the cache survives for installed users.
- Anything new that holds a secret must remove it in its query function or opt out with `meta: { persist: false }`.
