
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5204/api/users";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: "",
    username: "",
    password: "",
    fName: "",
    lName: "",
    userRoleId: ""
  });

  useEffect(() => {
    loadData();
  }, [id]);

  /* ---------- LOAD USER + ROLES ---------- */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
            const rolesParams = new URLSearchParams({
        pageNum: "1",
        pageSize: "100",
        sortBy: "name",
        sortDirection: "0"
      });
      const [userRes, rolesRes] = await Promise.all([
        fetch(`${API_URL}/getuser/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				}),
        fetch(`${API_URL}/getroles?${rolesParams.toString()}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				})
      ]);

      if (!userRes.ok) throw new Error("Failed to load user");
      if (!rolesRes.ok) throw new Error("Failed to load roles");

      const user = await userRes.json();
      const rolesData = await rolesRes.json();

      setRoles(rolesData);

      setForm({
        id: user.id,
        username: user.username,
        password: user.password,
        fName: user.fName,
        lName: user.lName,
        userRoleId: user.userRoleID
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SUBMIT ---------- */

  const submitUpdate = async () => {
    setError("");

    const response = await fetch(
      `${API_URL}/edituser`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ID: Number(form.id),
          Username: form.username,
          Password: form.password,
          FName: form.fName,
          LName: form.lName,
          UserRoleID: Number(form.userRoleId)
        })
      }
    );

    if (!response.ok) {
      setError("Failed to update user");
      return;
    }

    navigate("/users/allusers");
  };

  /* ---------- UI ---------- */

  if (loading) return <p>Loading...</p>;

  return (
    <div>
          <div className="page-header">
        <button className="page-back" style={{textAlign: "left"}} onClick={() => navigate("/users/allusers")}>
          ← Back
        </button>


      </div>
      <div className="form-page">
 <h2 className="page-title">Edit User</h2>
      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label>Username</label>
        <br />
        <input
          type="text"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <br />
        <input
          type="password"
          placeholder = "Leave blank to keep the same password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label>First Name</label>
        <br />
        <input
          type="text"
          value={form.fName}
          onChange={(e) =>
            setForm({ ...form, fName: e.target.value })
          }
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <br />
        <input
          type="text"
          value={form.lName}
          onChange={(e) =>
            setForm({ ...form, lName: e.target.value })
          }
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label>Role</label>
        <br />
        <select
          value={form.userRoleId}
          onChange={(e) =>
            setForm({ ...form, userRoleId: e.target.value })
          }
        >
          <option value="">-- Select role --</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <br />
 <div className="form-actions">
     
      <button onClick={submitUpdate}>Save</button>
      <button onClick={() => navigate("/users/allusers")}>Cancel</button>
  </div>
      </div>
       </div>
  );
}

export default EditUser;
