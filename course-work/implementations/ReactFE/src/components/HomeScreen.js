import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "../styles/home.css";

function HomeScreen({ userRoleId }) {
  const navigate = useNavigate();
  const { user } = useAuth();

if (!user) {
  return <p className="home-loading">Loading...</p>;
}

const roleId = Number(user.roleId);

return (
  <div className="home-page">
    <h2 className="home-title">Dashboard</h2>

    {/* ADMIN */}
    {roleId === 100001 && (
      <section className="role-section">
        <h3>Administration</h3>

        <div className="role-grid">
          <div
            className="dashboard-card"
            onClick={() => navigate("/roles/manage-roles")}
          >
            <div className="dashboard-card-title">Manage Roles</div>
            <div className="dashboard-card-sub">
              Configure system permission roles
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/users/allusers")}
          >
            <div className="dashboard-card-title">Manage Users</div>
            <div className="dashboard-card-sub">
              View and control staff accounts
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/partners/all")}
          >
            <div className="dashboard-card-title">Manage Partners</div>
            <div className="dashboard-card-sub">
              External collaborators and institutions
            </div>
          </div>
        </div>
      </section>
    )}

    {/* CURATOR */}
    {(roleId === 100002 || roleId === 100001) && (
      <section className="role-section">
        <h3>Curatorial Management</h3>

        <div className="role-grid">
          <div
            className="dashboard-card"
            onClick={() => navigate("/exhibits/all")}
          >
            <div className="dashboard-card-title">Exhibits</div>
            <div className="dashboard-card-sub">
              Manage museum exhibitions
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/rooms/all")}
          >
            <div className="dashboard-card-title">Rooms</div>
            <div className="dashboard-card-sub">
              Configure display spaces
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/collections/manage")}
          >
            <div className="dashboard-card-title">Collections</div>
            <div className="dashboard-card-sub">
              Organize artifact collections
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/items/all")}
          >
            <div className="dashboard-card-title">Items</div>
            <div className="dashboard-card-sub">
              Manage individual artifacts
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/attributes/all")}
          >
            <div className="dashboard-card-title">Attributes</div>
            <div className="dashboard-card-sub">
              Configure item metadata
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/loans/all")}
          >
            <div className="dashboard-card-title">Loans</div>
            <div className="dashboard-card-sub">
              Track borrowed and loaned pieces
            </div>
          </div>
        </div>
      </section>
    )}

    {/* RESEARCH / STUDIES */}
    {(roleId === 100003 || roleId === 100001) && (
      <section className="role-section">
        <h3>Research & Education</h3>

        <div className="role-grid">
          <div
            className="dashboard-card"
            onClick={() => navigate("/studies/all")}
          >
            <div className="dashboard-card-title">Studies</div>
            <div className="dashboard-card-sub">
              Manage research programs
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/students/all")}
          >
            <div className="dashboard-card-title">Students</div>
            <div className="dashboard-card-sub">
              Manage student researchers
            </div>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/funds/all")}
          >
            <div className="dashboard-card-title">Funds</div>
            <div className="dashboard-card-sub">
              Track grants and research funding
            </div>
          </div>
        </div>
      </section>
    )}
  </div>
);
}

export default HomeScreen;