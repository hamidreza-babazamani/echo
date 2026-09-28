import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext.jsx";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

// ==================== PROTECTED ROUTE ====================
const ProtectedRoute = ({ children }) => {
  const { authUser, token } = useAuth();

  // اگه توکن هست ولی authUser هنوز لود نشده، صبر کن
  if (token && !authUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020817",
          color: "#a78bfa",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  // اگه authUser نیست، برو Login
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ==================== PUBLIC ROUTE (Login) ====================
const PublicRoute = ({ children }) => {
  const { authUser, token } = useAuth();

  // اگه کاربر لاگینـه، برو HomePage
  if (authUser || token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ==================== APP ====================
const App = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Public Route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Catch all → Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;