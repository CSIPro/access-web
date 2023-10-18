/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable check-file/filename-naming-convention */
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useSigninCheck } from "reactfire";

import { Splash } from "./components/splash/splash";
import { RoomProvider } from "./context/room-context";
import { AppIndex } from "./routes/app";
import { LogsPage } from "./routes/app/logs";
import { QRCodePage } from "./routes/app/qr-code";
import { AuthCallback } from "./routes/auth-callback/auth-callback";
import { CompleteSignup } from "./routes/complete-signup";
import { Login } from "./routes/login";
import { MainApp } from "./routes/main-app";
import { AuthedRoute, UnauthedRoute } from "./routes/protected-route";

function App() {
  const { status, data, error } = useSigninCheck();

  if (status === "loading") {
    return <Splash loading />;
  }

  if (status === "error") {
    return <Splash message={error?.message ?? "Something went wrong"} />;
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-muted font-sans text-white">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AuthedRoute
                isAuthenticated={data.signedIn}
                userUid={data.user?.uid}
              />
            }
          >
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route
              path="/app"
              element={
                <RoomProvider>
                  <MainApp />
                </RoomProvider>
              }
            >
              <Route path="/app" element={<AppIndex />} />
              <Route path="/app/logs" element={<LogsPage />} />
              <Route path="/app/qr-code" element={<QRCodePage />} />
            </Route>
          </Route>
          <Route path="/complete-signup" element={<CompleteSignup />} />
          <Route
            path="/login"
            element={data.signedIn ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/oauth/callback"
            element={data.signedIn ? <Navigate to="/" /> : <AuthCallback />}
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-center" />
    </main>
  );
}

export default App;
