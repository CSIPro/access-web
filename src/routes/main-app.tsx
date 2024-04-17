import { Outlet } from "react-router-dom";

export const MainApp = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
      <Outlet />
    </div>
  );
};
