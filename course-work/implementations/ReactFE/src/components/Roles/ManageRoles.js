import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/users";

function ManageRoles() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleName, setRoleName] = useState("");
 const [searchRoleName, setSearchRoleName] = useState("");
  const [searchDtCreated, setSearchDtCreated] = useState("");

  const [appliedRoleName, setAppliedRoleName] = useState("");
  const [appliedDtCreated, setAppliedDtCreated] = useState("");

  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState(0);

  useEffect(() => {
    fetchRoles();
  }, [pageNum, sortBy, sortDirection, appliedRoleName, appliedDtCreated]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString()
      });

      if (appliedRoleName.trim() !== "") {
        params.append("roleName", appliedRoleName.trim());
      }
      if (appliedDtCreated !== "") {
        params.append("dtCreated", appliedDtCreated);
      }

      const response = await fetch(`${API_URL}/getroles?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      const data = await response.json();
      setRoles(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch roles from application service layer.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); 
    setAppliedRoleName(searchRoleName);
    setAppliedDtCreated(searchDtCreated);
  };

  const submitAdd = async () => {
    await fetch(`${API_URL}/addrole`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ Name: roleName })
    });

    setShowAdd(false);
    setRoleName("");
    fetchRoles();
  };

  const submitEdit = async () => {
    await fetch(`${API_URL}/editrole`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ID: selectedRole.id,
        Name: roleName
      })
    });

    setShowEdit(false);
    setSelectedRole(null);
    setRoleName("");
    fetchRoles();
  };

  const submitDelete = async () => {
    try{
      const response =    await fetch(
      `${API_URL}/deleterole/${selectedRole.id}`,
      { method: "DELETE", headers: {
                    Authorization: `Bearer ${token}`
                  } }
    );
if (!response.ok) throw new Error("Server rejected deletion constraint rule.");

      setShowDelete(false);
      setSelectedRole(null);

      if (roles.length === 1 && pageNum > 1) {
        setPageNum((prev) => prev - 1);
      } else {
        fetchRoles();
      }
    }catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div>
    <div className="page-header">
  <button className="page-back" onClick={() => navigate("/home")}>
    ← Back
  </button>

  <h2 className="page-title">Manage Roles</h2>

  <button className="primary-button" onClick={() => setShowAdd(true)}>
    Add New Role
  </button>
</div>
    <div className="filter-panel">
        <form class="filters-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Filter Role Name..."
            value={searchRoleName}
            onChange={(e) => setSearchRoleName(e.target.value)}
            className="filters-input"
          />
          <input
            type="date"
            title="Date Created"
            value={searchDtCreated}
            onChange={(e) => setSearchDtCreated(e.target.value)}
            className="filters-input"
          />
          <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
        </form>

        <div className="filters-form">
          <div>
            <label style={{marginRight: "5px" }}>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
              <option value="name">Role Name</option>
              <option value="dtCreated">Creation Date</option>
            </select>
          </div>

          <div>
            <label style={{marginRight: "5px" }}>Direction:</label>
            <select value={sortDirection} onChange={(e) => setSortDirection(Number(e.target.value))} className="filters-select">
              <option value={0}>Ascending</option>
              <option value={1}>Descending</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: "10px", color: "red", background: "#fde8e8", borderRadius: "4px", marginBottom: "15px" }}>
          {error}
        </div>
      )}


      <table className="data-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {roles.length === 0 && (
            <tr>
              <td colSpan="3" className="table-empty">No roles found</td>
            </tr>
          )}

          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>

              <td className="table-actions">
                <button
                className="action-button"
                  onClick={() => {
                    setSelectedRole(role);
                    setRoleName(role.name);
                    setShowEdit(true);
                  }}
                >
                  Edit
                </button>
              </td>

              <td className="table-actions">
                <button
                  className="action-button danger"
                  onClick={() => {
                    setSelectedRole(role);
                    setShowDelete(true);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    <div className="paging-form">
        <button
          disabled={pageNum === 1}
          onClick={() => setPageNum((p) => Math.max(p - 1, 1))}
          style={{ padding: "3px 7px" }}
        >
          &larr; Prev
        </button>
        <span>Page {pageNum}</span>
        <button
          disabled={roles.length < pageSize}
          onClick={() => setPageNum((p) => p + 1)}
          style={{ padding: "3px 7px" }}
        >
          Next &rarr;
        </button>
      </div>


      {showAdd && (
        <div className="modal">
          <h3>Add Role</h3>

          <input
            type="text"
            placeholder="Role name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            maxLength={40}
          />

          <button onClick={submitAdd}>Save</button>
          <button onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}

      {showEdit && (
        <div className="modal">
          <h3>Edit Role</h3>

          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            maxLength={40}
          />

          <button onClick={submitEdit}>Save</button>
          <button onClick={() => setShowEdit(false)}>Cancel</button>
        </div>
      )}

      {showDelete && (
        <div className="modal">
          <h3>Are you sure?</h3>
          <p>Delete role: {selectedRole.name}</p>

          <button onClick={submitDelete}>Yes</button>
          <button onClick={() => setShowDelete(false)}>No</button>
        </div>
      )}
    </div>
  );
}

export default ManageRoles;