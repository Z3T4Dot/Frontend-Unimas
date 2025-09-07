import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Book from "./pages/Book";
import MyAppointments from "./pages/MyAppointments";
import Navbar from "./components/Navbar";
import useAuthUser from "./hooks/useAuthUser";

function Protected({ children }: { children: JSX.Element }) {
  const me = useAuthUser();
  return me ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const me = useAuthUser();
  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route
            path="/login"
            element={me ? <Navigate to="/book" replace /> : <Login />}
          />
          <Route
            path="/book"
            element={
              <Protected>
                <Book />
              </Protected>
            }
          />
          <Route
            path="/me"
            element={
              <Protected>
                <MyAppointments />
              </Protected>
            }
          />
          <Route
            path="*"
            element={<Navigate to={me ? "/book" : "/login"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}
