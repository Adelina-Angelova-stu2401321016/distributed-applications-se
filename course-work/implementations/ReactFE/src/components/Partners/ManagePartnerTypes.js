import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/partner";

function ManagePartnerTypes(){
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
const token = localStorage.getItem("token");
				
  const [selectedType, setSelectedType] = useState(null);
  const [typeName, setTypeName] = useState("");
const [searchTypeName, setSearchTypeName] = useState("");
  const [searchDtCreated, setSearchDtCreated] = useState("");

  const [appliedTypeName, setAppliedTypeName] = useState("");
  const [appliedDtCreated, setAppliedDtCreated] = useState("");

  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState("typeName");
  const [sortDirection, setSortDirection] = useState(0);

   useEffect(() => {
    fetchTypes();
  }, [pageNum, sortBy, sortDirection, appliedTypeName, appliedDtCreated]);
  
    const fetchTypes = async () => {
     try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString()
      });

      if (appliedTypeName.trim() !== "") {
        params.append("typeName", appliedTypeName.trim());
      }
      if (appliedDtCreated !== "") {
        params.append("dtCreated", appliedDtCreated);
      }

      const response = await fetch(`${API_URL}/getpartnertypes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Server returned execution exception: ${response.status}`);
      }

      const data = await response.json();
      setTypes(data);
    } catch (err) {
      console.error(err);
      setError("Failed to coordinate master partner type collection matrix.");
      setTypes([]);
    } finally {
      setLoading(false);
    }
    };

   const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); 
    setAppliedTypeName(searchTypeName);
    setAppliedDtCreated(searchDtCreated);
  };

    const submitAdd = async () => {
      await fetch(`${API_URL}/addpartnertype`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ TypeName: typeName })
      });
  
      setShowAdd(false);
      setTypeName("");
      fetchTypes();
    };
  
    const submitEdit = async () => {
      await fetch(`${API_URL}/editpartnertype`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ID: selectedType.id,
          TypeName: typeName
        })
      });
  
      setShowEdit(false);
      setSelectedType(null);
      setTypeName("");
      fetchTypes();
    };
  
    const submitDelete = async () => {
      try{
        const response = await fetch(
        `${API_URL}/deletepartnertype/${selectedType.id}`,
        { method: "DELETE", headers: {
                    Authorization: `Bearer ${token}`
                  } }
      );
  if (!response.ok) throw new Error("Deletion directive rejected.");

      setShowDelete(false);
      setSelectedType(null);
      
      if (types.length === 1 && pageNum > 1) {
        setPageNum((prev) => prev - 1);
      } else {
        fetchTypes();
      }
    } catch (err) {
      alert(err.message);
    }
  };

     if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div>
  <div className="page-header">
    <button
      className="page-back"
      onClick={() => navigate("/partners/all")}
    >
      ← Back
    </button>

    <button
      className="primary-button"
      onClick={() => setShowAdd(true)}
    >
      Add New Type
    </button>
  </div>

  <h2 className="page-title">Manage Types</h2>
      <div className="filter-panel">
        <form onSubmit={handleSearchSubmit} class="filters-form">
          <input
            type="text"
            placeholder="Filter Type Name..."
            value={searchTypeName}
            onChange={(e) => setSearchTypeName(e.target.value)}
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

        <div class="filters-form">
          <div>
            <label style={{marginRight: "5px" }}>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
              <option value="typeName">Type Name</option>
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
        <th>Type</th>
        <th>Edit</th>
        <th>Delete</th>
      </tr>
    </thead>

    <tbody>
      {types.length === 0 && (
        <tr>
          <td colSpan="3" className="table-empty">
            No types found
          </td>
        </tr>
      )}

      {types.map((type) => (
        <tr key={type.id}>
          <td>{type.typeName}</td>

          <td>
            <div className="table-actions">
              <button
                className="action-button"
                onClick={() => {
                  setSelectedType(type);
                  setTypeName(type.typeName);
                  setShowEdit(true);
                }}
              >
                Edit
              </button>
            </div>
          </td>

          <td>
            <div className="table-actions">
              <button
                className="action-button danger"
                onClick={() => {
                  setSelectedType(type);
                  setShowDelete(true);
                }}
              >
                Delete
              </button>
            </div>
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
          disabled={types.length < pageSize}
          onClick={() => setPageNum((p) => p + 1)}
          style={{ padding: "3px 7px" }}
        >
          Next &rarr;
        </button>
      </div>


  {showAdd && (
    <div className="modal">
      <h3>Add Type</h3>

      <input
        type="text"
        placeholder="Type name"
        value={typeName}
        onChange={(e) => setTypeName(e.target.value)}
        maxLength={100}
      />

      <button onClick={submitAdd}>Save</button>
      <button onClick={() => setShowAdd(false)}>Cancel</button>
    </div>
  )}

  {showEdit && (
    <div className="modal">
      <h3>Edit Type</h3>

      <input
        type="text"
        value={typeName}
        onChange={(e) => setTypeName(e.target.value)}
        maxLength={100}
      />

      <button onClick={submitEdit}>Save</button>
      <button onClick={() => setShowEdit(false)}>Cancel</button>
    </div>
  )}

  {showDelete && (
    <div className="modal">
      <h3>Are you sure?</h3>

      <p>
        Delete type: <strong>{selectedType.typeName}</strong>
      </p>

      <button onClick={submitDelete}>Yes</button>
      <button onClick={() => setShowDelete(false)}>No</button>
    </div>
  )}
    </div>
  );
  
  
}

export default ManagePartnerTypes; 