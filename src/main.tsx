import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
import { Toaster } from "./components/ui/toaster.tsx";
import "./index.css";
import { firebaseConfig } from "./firebase.ts";

const queryClient = new QueryClient();

const firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebase);
const auth = getAuth(firebase);
const firestore = getFirestore(firebase);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FirebaseAppProvider firebaseApp={firebase}>
        <AnalyticsProvider sdk={analytics}>
          <AuthProvider sdk={auth}>
            <FirestoreProvider sdk={firestore}>
              <App />
              <Toaster />
            </FirestoreProvider>
          </AuthProvider>
        </AnalyticsProvider>
      </FirebaseAppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
