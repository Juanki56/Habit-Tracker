import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { router } from "./app/router";

export function App() {
  return (
    <AuthProvider>
      <div className="scanline-sweep" aria-hidden="true" />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
