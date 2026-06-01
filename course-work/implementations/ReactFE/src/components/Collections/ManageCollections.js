import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/collection";

function ManageCollections() {
 /* const navigate = useNavigate();*/
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
const token = localStorage.getItem("token");
				
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionName, setCollectionName] = useState("");

const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedSearchDate, setAppliedSearchDate] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5); 
  const [sortBy, setSortBy] = useState("collName");
  const [sortDirection, setSortDirection] = useState(0);
  
  useEffect(() => {
    fetchCollections();
  }, [pageNum, sortBy, sortDirection, appliedSearchTerm, appliedSearchDate]);

  const handleServerError = async (response, fallbackMessage) => {
    try {
      const errorData = await response.json();
      setError(errorData.message || fallbackMessage);
    } catch {
      setError(fallbackMessage);
    }
  };

  const fetchCollections = async () => {
        setLoading(true);
    setError("");
    try {
      // Build expected controller query strings
      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString(),
      });
if (appliedSearchTerm.trim() !== "") {
        params.append("collName", appliedSearchTerm.trim());
      }

      if (appliedSearchDate !== "") {
        params.append("dtCreated", appliedSearchDate);
      }

      const response = await fetch(`${API_URL}/getcollections?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleServerError(response, "Failed to load collections.");
        return;
      }

      const data = await response.json();
      setCollections(data);
    } catch (err) {
      setError("Network error: Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };
const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); 
    setAppliedSearchTerm(searchTerm);
    setAppliedSearchDate(searchDate);
  };

  const submitAdd = async () => {
   setError("");
    try {
      const response = await fetch(`${API_URL}/add-collection`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ CollName: collectionName }),
      });

      if (!response.ok) {
        await handleServerError(response, "Could not add new collection.");
        return;
      }

      setShowAdd(false);
      setCollectionName("");
      setPageNum(1); 
      fetchCollections();
    } catch {
      setError("Network error while adding collection.");
    }
  };

  const submitEdit = async () => {
   setError("");
    try {
      const response = await fetch(`${API_URL}/editcollection`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ID: selectedCollection.id,
          CollName: collectionName,
        }),
      });

      if (!response.ok) {
        await handleServerError(response, "Could not update collection.");
        return;
      }

      setShowEdit(false);
      setSelectedCollection(null);
      setCollectionName("");
      fetchCollections();
    } catch {
      setError("Network error while editing collection.");
    }
  };

  const submitDelete = async () => {
   setError("");
    try {
      const response = await fetch(`${API_URL}/deletecollection/${selectedCollection.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleServerError(response, "Could not delete collection.");
        return;
      }

      setShowDelete(false);
      setSelectedCollection(null);
      fetchCollections();
    } catch {
      setError("Network error while deleting collection.");
    }
  };

 if (loading) return <p className="loading-text">Loading...</p>;

return (
  <div>

    <div className="page-header">
      <h2 className="page-title">Manage Collections</h2>

      <button
        className="primary-button"
        onClick={() => setShowAdd(true)}
      >
        Add New Collection
      </button>
    </div>

    <div className="filter-panel">
        <form onSubmit={handleSearchSubmit} class="filters-form">
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filters-input"
          />

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <label>Created Date: </label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="filters-input"
            />
          </div>

          <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
        </form>
       <div class="filters-form">
        <div>
          <label style={{marginRight: "5px" }}>Sort By: </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
            <option value="collName">Name</option>
            <option value="dtCreated">Date Created</option>
          </select>
        </div>

        <div>
          <label style={{marginRight: "5px" }}>Direction: </label>
          <select value={sortDirection} onChange={(e) => setSortDirection(Number(e.target.value))} className="filters-select">
            <option value={0}>Ascending</option>
            <option value={1}>Descending</option>
          </select>
        </div>

       </div>
      </div>

      {error && (
        <div className="form-error" style={{ background: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    
    <table className="data-table">
      <thead>
        <tr>
          <th>Collection</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>

      <tbody>
        {collections.length === 0 && (
          <tr>
            <td colSpan="3" className="table-empty">
              No collections found
            </td>
          </tr>
        )}

        {collections.map((collection) => (
          <tr key={collection.id}>
            <td>{collection.collName}</td>

            <td>
              <div className="table-actions">
                <button
                  className="action-button"
                  onClick={() => {
                    setSelectedCollection(collection);
                    setCollectionName(collection.collName);
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
                    setSelectedCollection(collection);
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
        <button disabled={pageNum === 1} onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))} style={{ padding: "3px 7px" }}
        >
          &larr; Prev
        </button>
        <span>Page {pageNum}</span>
        <button disabled={collections.length < pageSize} onClick={() => setPageNum((prev) => prev + 1)} style={{ padding: "3px 7px" }}
        >
          Next &rarr;
        </button>
      </div>
    {/* ===== Add Modal ===== */}
    {showAdd && (
      <div className="modal">
        <h3>Add Collection</h3>

        <input
          type="text"
          placeholder="Collection name"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          maxLength={255}
        />

        <button onClick={submitAdd}>Save</button>
        <button onClick={() => setShowAdd(false)}>Cancel</button>
      </div>
    )}

    {/* ===== Edit Modal ===== */}
    {showEdit && (
      <div className="modal">
        <h3>Edit Collection</h3>

        <input
          type="text"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          maxLength={255}
        />

        <button onClick={submitEdit}>Save</button>
        <button onClick={() => setShowEdit(false)}>Cancel</button>
      </div>
    )}

    {/* ===== Delete Modal ===== */}
    {showDelete && (
      <div className="modal">
        <h3>Are you sure?</h3>

        <p>
          Delete collection: <strong>{selectedCollection.collName}</strong>
        </p>

        <button onClick={submitDelete}>Yes</button>
        <button onClick={() => setShowDelete(false)}>No</button>
      </div>
    )}

  </div>
);

}

export default ManageCollections;