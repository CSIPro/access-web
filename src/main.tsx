import { es } from "date-fns/locale";
import setDefaultOptions from "date-fns/setDefaultOptions";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import {
  AnalyticsProvider,
  AuthProvider,
  FirebaseAppProvider,
  FirestoreProvider,
} from "reactfire";

import App from "./App.tsx";
import "./index.css";
import { analytics, firebase, firebaseAuth, firestore } from "./firebase.ts";

setDefaultOptions({
  locale: es,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FirebaseAppProvider firebaseApp={firebase}>
        <AnalyticsProvider sdk={analytics}>
          <AuthProvider sdk={firebaseAuth}>
            <FirestoreProvider sdk={firestore}>
              <App />
            </FirestoreProvider>
          </AuthProvider>
        </AnalyticsProvider>
      </FirebaseAppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
