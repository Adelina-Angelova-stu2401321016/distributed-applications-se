import "../styles/Layout.css";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
const roleNames = {
  100001: "Admin",
  100002: "Curator",
  100003: "Research"
};
  return (
    <>
      <header className="layout-header">
        {user ? (
          <>
            <div className="header-left">
              <button
                className="museum-button primary"
                onClick={() => navigate("/home")}
              >
                Home
              </button>
            </div>

            <div className="header-right">
              <span className="user-info">
                Welcome, <strong>{user.fName}</strong> (Role: {roleNames[user.roleId] || `Role ${user.roleId}`})
              </span>

              <button
                className="museum-button logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <span className="user-info">Not logged in</span>
        )}
      </header>

      <main className="layout-main">
        <div className="content-surface">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export default Layout;
