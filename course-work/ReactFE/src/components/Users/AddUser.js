import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/users";

function AddUser(){
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
				
    const [roles, setRoles] = useState([]);

  const [form, setForm] = useState({
    username: "",
    password: "",
    fName: "",
    lName: "",
    userRoleID: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
       setLoading(true);
      setError("");

      const queryParams = new URLSearchParams({
        pageNum: "1",
        pageSize: "100", 
        sortBy: "name",
        sortDirection: "0"
      });

      const response = await fetch(`${API_URL}/getroles?${queryParams.toString()}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				});
      const data = await response.json();
      setRoles(data);
    } catch {
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const submitUser = async () => {
    setError("");

    const response = await fetch(`${API_URL}/adduser`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`  },
      body: JSON.stringify({
        Username: form.username,
        Password: form.password,
        FName: form.fName,
        LName: form.lName,
        UserRoleId: Number(form.userRoleId)
      })
    });

    if (!response.ok) {
      setError("Failed to add user");
      return;
    }
    navigate("/users/allusers");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
          <div className="page-header">
        <button className="page-back" style={{textAlign: "left"}} onClick={() => navigate("/users/allusers")}>
          ← Back
        </button>


      </div>
<div className="form-page">
        <h2 className="page-title">Add Users</h2>
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
      <button onClick={submitUser}>Add User</button>
      <button onClick={() => navigate("/users/allusers")}>Cancel</button>
      </div>
      </div>
    </div>
  );
}

export default AddUser;