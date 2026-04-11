import { useEffect, useState } from "react";
import EntryPage from "./pages/EntryPage.jsx";
import GuestWall from "./pages/GuestWall.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import { clearAuth, loadAuth } from "./auth.js";

export default function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const auth = loadAuth();
    if (auth) setRole(auth.role);
  }, []);

  const logout = () => {
    clearAuth();
    setRole(null);
  };

  return (
    <div className={`app ${role ? `app--${role}` : ""}`}>
      {role === null && <EntryPage onEnter={setRole} />}
      {role === "admin" && <AdminPanel onLogout={logout} />}
      {role === "visitor" && <GuestWall onLogout={logout} />}
    </div>
  );
}
