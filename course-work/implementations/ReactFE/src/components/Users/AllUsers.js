import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/users";

function AllUsers(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
const [error, setError] = useState("");
  const navigate = useNavigate();
    const [searchUserName, setSearchUserName] = useState("");
  const [searchRoleName, setSearchRoleName] = useState("");
  const [appliedUserName, setAppliedUserName] = useState("");
  const [appliedRoleName, setAppliedRoleName] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState("userName");
  const [sortDirection, setSortDirection] = useState(0);

useEffect(() => {
    fetchUsers();
  }, [pageNum, sortBy, sortDirection, appliedUserName, appliedRoleName]);

  const fetchUsers = async () => {
   try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString()
      });

      if (appliedUserName.trim() !== "") {
        params.append("userName", appliedUserName.trim());
      }
      if (appliedRoleName.trim() !== "") {
        params.append("roleName", appliedRoleName.trim());
      }

      const response = await fetch(`${API_URL}/getusers?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned error validation status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to sync system users matrix registry.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); 
    setAppliedUserName(searchUserName);
    setAppliedRoleName(searchRoleName);
    console.log(searchRoleName);
  };

  const deleteUser = async () => {
    try{
      const response =    await fetch(
      `${API_URL}/deleteuser/${selectedUser.id}`,
      { method: "DELETE", headers: {
                    Authorization: `Bearer ${token}`
                  } }
    );
      if (response.ok) {
        setShowDelete(false);
        setSelectedUser(null);
  if (users.length === 1 && pageNum > 1) {
          setPageNum((prev) => prev - 1);
        } else {
          fetchUsers();
        }
      } else {
        alert("Server validation error rejected user deletion workflows.");
      }
    } catch (err) {
      console.error(err);
    }
 };

  if (loading) {
    return <p className="loading-text">Loading users...</p>;
  }

  return (
    <div>
      <div className="page-header">
  <button className="page-back" onClick={() => navigate("/home")}>
    ← Back
  </button>

  <h2 className="page-title">Users</h2>

  <button className="primary-button" onClick={() => navigate("/users/add")}>
    Add New User
  </button>
</div>
 
       <div className="filter-panel">
        <form onSubmit={handleFilterSubmit} class="filters-form">
          <input
            type="text"
            placeholder="Search Full Name..."
            value={searchUserName}
            onChange={(e) => setSearchUserName(e.target.value)}
            className="filters-input"
          />
          <input
            type="text"
            placeholder="Filter Role Name..."
            value={searchRoleName}
            onChange={(e) => setSearchRoleName(e.target.value)}
            className="filters-input"
          />
          <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
        </form>
        <div className="filters-form">
          <div>
            <label style={{marginRight: "5px" }}>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
              <option value="userName">User Name (Last Name)</option>
              <option value="userRole">User Role Name</option>
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
        <div style={{ color: "red", padding: "10px", background: "#fde8e8", borderRadius: "4px", marginBottom: "15px", fontWeight: "bold" }}>
          {error}
        </div>
      )}

 
      <table className="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Role</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="6" className="table-empty">No users found</td>
            </tr>
          )}

          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.fName}</td>
              <td>{user.lName}</td>
              <td>{user.userRole}</td>

          <td className="table-actions">
                <button
                className="action-button"
                      onClick={() => navigate(`/users/edit/${user.id}`)}
                >
                  Edit
                </button>
              </td>

        <td className="table-actions">
                <button
                  className="action-button danger"
          onClick={() => {
                    setSelectedUser(user);
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
              onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}
              style={{ padding: "3px 7px" }}
            >
              &larr; Previous
            </button>
            <span> Page {pageNum}</span>
            <button
              disabled={users.length < pageSize}
              onClick={() => setPageNum((prev) => prev + 1)}
              style={{ padding: "3px 7px" }}
            >
              Next &rarr;
            </button>
          </div>
 

      {showDelete && (
        <div className="modal">
          <h3>Are you sure?</h3>
          <p>
            Delete user <strong>{selectedUser.username}</strong>?
          </p>

          <button onClick={deleteUser}>Yes</button>
          <button onClick={() => setShowDelete(false)}>No</button>
        </div>
      )}
    </div>
  );

}

export default AllUsers;