import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { es } from "date-fns/locale";
import setDefaultOptions from "date-fns/setDefaultOptions";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  AnalyticsProvider,
  AuthProvider,
  FirebaseAppProvider,
  FirestoreProvider,
} from "reactfire";

import App from "./App.tsx";
import { RestoreGate } from "./components/splash/restore-gate.tsx";
import "./index.css";
import { analytics, firebase, firebaseAuth, firestore } from "./firebase.ts";
import { getSessionCache } from "./lib/session-cache.ts";

setDefaultOptions({
  locale: es,
});

const { queryClient, persistOptions } = getSessionCache();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <FirebaseAppProvider firebaseApp={firebase}>
        <AnalyticsProvider sdk={analytics}>
          <AuthProvider sdk={firebaseAuth}>
            <FirestoreProvider sdk={firestore}>
              <RestoreGate>
                <App />
              </RestoreGate>
            </FirestoreProvider>
          </AuthProvider>
        </AnalyticsProvider>
      </FirebaseAppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
