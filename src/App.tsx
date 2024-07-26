/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable check-file/filename-naming-convention */
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useSigninCheck } from "reactfire";

import { Splash } from "./components/splash/splash";
import { RoleProvider } from "./context/role-context";
import { RoomProvider } from "./context/room-context";
import { UserProvider } from "./context/user-context";
import { AppIndex } from "./routes/app";
import { LogsPage } from "./routes/app/logs";
import { RoomMembers } from "./routes/app/members";
import { NotificationsPage } from "./routes/app/notifications";
import { PasscodePage } from "./routes/app/passcode";
import { QRCodePage } from "./routes/app/qr-code";
import { AuthCallback } from "./routes/auth-callback/auth-callback";
import { GithubLink } from "./routes/auth-callback/github-link";
import { CompleteSignup } from "./routes/complete-signup";
import { Login } from "./routes/login";
import { MainApp } from "./routes/main-app";
import { AuthedRoute } from "./routes/protected-route";

function App() {
  const { status, data, error } = useSigninCheck();

  if (status === "loading") {
    return <Splash loading />;
  }

  if (status === "error") {
    return (
      <Splash message={error?.message ?? "No pareces estar autenticado"} />
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-muted font-sans text-white">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<AuthedRoute isAuthenticated={data.signedIn} />}
          >
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route
              path="/app"
              element={
                <RoomProvider>
                  <RoleProvider>
                    <UserProvider>
                      <MainApp />
                    </UserProvider>
                  </RoleProvider>
                </RoomProvider>
              }
            >
              <Route path="/app" element={<AppIndex />} />
              <Route path="/app/logs" element={<LogsPage />} />
              <Route path="/app/members" element={<RoomMembers />} />
              <Route path="/app/passcode" element={<PasscodePage />} />
              <Route
                path="/app/notifications"
                element={<NotificationsPage />}
              />
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
          <Route path="/oauth/link/:code" element={<GithubLink />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-center"
        toastOptions={{
          className:
            "border-2 border-primary bg-primary/80 bg-muted text-white font-sans text-lg",
          error: {
            className:
              "border-2 border-secondary bg-secondary/80 bg-muted text-white font-sans text-lg",
          },
          style: {
            // backgroundColor: "#0d0d0d",
            color: "white",
          },
        }}
      />
    </main>
  );
}

export default App;
