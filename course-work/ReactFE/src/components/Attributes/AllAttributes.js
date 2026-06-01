import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/attribute";

function AllAttributes() {
  const navigate = useNavigate();
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDelete, setShowDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [AttrName, setAttrName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedSearchDate, setAppliedSearchDate] = useState("");

  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5); 
  const [sortBy, setSortBy] = useState("attrName");
  const [sortDirection, setSortDirection] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAttributes();
  }, [pageNum, sortBy, sortDirection, appliedSearchTerm, appliedSearchDate]);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString(),
      });

      if (appliedSearchTerm.trim() !== "") {
        params.append("attrName", appliedSearchTerm.trim());
      }

      if (appliedSearchDate !== "") {
        params.append("dtCreated", appliedSearchDate);
      }

      const response = await fetch(`${API_URL}/getattributes?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error ${errorData.statusCode || response.status}: ${errorData.message || "Failed to load data"}`);
        return;
      }
      
      const data = await response.json();
      setAttributes(data);
    } catch (error) {
      alert("An unexpected error occurred while communicating with the server.");
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
    try {
      const response = await fetch(`${API_URL}/addattribute`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ AttrName: AttrName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to add attribute"}`);
        return;
      }

      setShowAdd(false);
      setAttrName("");
      setPageNum(1);
      fetchAttributes();
    } catch (error) {
      alert("An unexpected error occurred while saving the attribute.");
    }
  };

  const submitDelete = async () => {
    try {
      const response = await fetch(
        `${API_URL}/delete-attribute/${selectedAttribute.id || selectedAttribute.ID}`,
        { 
          method: "DELETE", 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to delete attribute"}`);
        return;
      }

      setShowDelete(false);
      setSelectedAttribute(null);
      fetchAttributes();
    } catch (error) {
      alert("An unexpected error occurred while deleting the attribute.");
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Manage Attributes</h2>
        <button className="primary-button" onClick={() => setShowAdd(true)}>
          Add New Attribute
        </button>
      </div>
    
      <div className="filter-panel">
        <form onSubmit={handleSearchSubmit} class="filters-form">
          <input
            type="text"
            placeholder="Search by name..."
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
            <option value="attrName">Attribute Name</option>
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

      <table className="data-table">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {attributes.length === 0 && (
            <tr>
              <td colSpan="3" className="table-empty">
                No attributes found
              </td>
            </tr>
          )}

          {attributes.map((attribute) => {
            const attrId = attribute.id || attribute.ID;
            const attrName = attribute.attrName || attribute.AttrName;
            
            return (
              <tr key={attrId}>
                <td>{attrName}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="action-button"
                      onClick={() => navigate(`/attributes/edit/${attrId}`)}
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
                        setSelectedAttribute(attribute);
                        setShowDelete(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="paging-form">
        <button 
          disabled={pageNum === 1} 
          onClick={() => setPageNum(prev => Math.max(prev - 1, 1))}
        style={{ padding: "3px 7px" }}
        >
          &larr; Prev
        </button>
        <span>Page {pageNum}</span>
        <button 
          disabled={attributes.length < pageSize} 
          onClick={() => setPageNum(prev => prev + 1)}
        style={{ padding: "3px 7px" }}
        >
          Next &rarr;
        </button>
      </div>
      
      {/* ===== Add Modal ===== */}
      {showAdd && (
        <div className="modal">
          <h3>Add Attribute</h3>
          <input
            type="text"
            placeholder="Attribute name"
            value={AttrName}
            onChange={(e) => setAttrName(e.target.value)}
            maxLength={50}
          />
          <button onClick={submitAdd}>Save</button>
          <button onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}

      {/* ===== Delete Modal ===== */}
      {showDelete && (
        <div className="modal">
          <h3>Are you sure?</h3>
          <p>
            Delete attribute: <strong>{selectedAttribute ? (selectedAttribute.attrName || selectedAttribute.AttrName) : ""}</strong>
          </p>
          <button onClick={submitDelete}>Yes</button>
          <button onClick={() => setShowDelete(false)}>No</button>
        </div>
      )}
    </div>
  );
}

export default AllAttributes;

