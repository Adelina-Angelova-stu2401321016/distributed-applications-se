import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


const API_URL = "http://localhost:5204/api/attribute";


function EditAttribute(){
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const [attrName, setAttrName] = useState("");
  const [attributeValues, setAttributeValues] = useState([]);
  const [loadingValues, setLoadingValues] = useState(true);
  const [showEditAttributeModal, setShowEditAttributeModal] = useState(false);
  const [newAttrName, setNewAttrName] = useState("");

  const [editValue, setEditValue] = useState(null);
  const [editValueName, setEditValueName] = useState("");

  const [deleteValue, setDeleteValue] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addValueName, setAddValueName] = useState("");
 
  const [valueSearchTerm, setValueSearchTerm] = useState("");
  const [valueSearchDate, setValueSearchDate] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedSearchDate, setAppliedSearchDate] = useState("");
  
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5); 
  const [sortBy, setSortBy] = useState("valueName");
  const [sortDirection, setSortDirection] = useState(0);

  useEffect(() => {
    fetchAttribute();
  }, [id]);

  useEffect(() => {
    fetchValues();
  }, [id, pageNum, sortBy, sortDirection, appliedSearchTerm, appliedSearchDate]);

  const handleServerError = async (response, fallbackMessage) => {
    try {
      const errorData = await response.json();
      setError(errorData.message || fallbackMessage);
    } catch {
      setError(fallbackMessage);
    }
  };

  const fetchAttribute = async () => {
    try {
      const res = await fetch(
        `${API_URL}/getattribute/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        await handleServerError(res, "Failed to load attribute details.");
        return;
      }
      const data = await res.json();
      setAttrName(data.attrName);
    } catch (err) {
      setError("Network error babes.");
    }
  };

  const fetchValues = async () => {
    setLoadingValues(true);
    setError("");
    try {
      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString(), // asc
      });
      if (appliedSearchTerm.trim() !== "") {
        params.append("attrValueName", appliedSearchTerm.trim());
      }

      if (appliedSearchDate !== "") {
        params.append("dtCreated", appliedSearchDate);
      }
      
      const res = await fetch(
        `${API_URL}/getattr-values/${id}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        await handleServerError(res, "Failed to load attribute values.");
        return;
      }
      setAttributeValues(await res.json());
    } catch {
      setError("Network error");
    }
    finally{
      setLoadingValues(false); 
    }
  };

  const handleValueSearchSubmit = (e) => {
    e.preventDefault();
    setPageNum(1);
    setAppliedSearchTerm(valueSearchTerm);
    setAppliedSearchDate(valueSearchDate);
  };

  const saveAttrName = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/editattribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ID: Number(id),
          AttrName: newAttrName,
        }),
      });

      if (!res.ok) {
        await handleServerError(res, "Could not update attribute name.");
        return;
      }

      setAttrName(newAttrName);
      setShowEditAttributeModal(false);
    } catch {
      setError("Network error while trying to update attribute name.");
    }
  };

   const submitAdd = async () => {
    setError("");
    try{
      const res =     await fetch(`${API_URL}/addattr-value`, {
      method: "POST",
      headers: { "Content-Type": "application/json",Authorization: `Bearer ${token}` },
      body: JSON.stringify({ AttrID: id, ValueName: addValueName })
    });
    if (!res.ok) {
        await handleServerError(res, "Could not add new value.");
        return;
      }

      setShowAdd(false);
      setAddValueName("");
      setPageNum(1); 
      fetchValues();
    } catch {
      setError("Network error while adding value.");
    }
    }

  

  const saveValueEdit = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/editattr-value`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ID: editValue.id,
          ValueName: editValueName,
        }),
      });

      if (!res.ok) {
        await handleServerError(res, "Could not save the updated value.");
        return;
      }

      setEditValue(null);
      fetchValues();
    } catch {
      setError("Network error while modifying value.");
    }
  };

  const confirmDeleteValue = async () => {
     setError("");
    try {
      const res = await fetch(`${API_URL}/delete-attr-value/${deleteValue.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        await handleServerError(res, "Could not delete value.");
        return;
      }

      setDeleteValue(null);
      fetchValues();
    } catch {
      setError("Network error while deleting value.");
    }
  };

  return(
    <div>
         <div className="page-header">
      <button
        className="page-back"
        onClick={() => navigate("/attributes/all")}
      >
        ← Back
      </button>


    </div>
<div className="mixed-page">

  <div className="page-header">
  
    <h2 className="page-title">{attrName}</h2>
  </div>

{error && (
          <div className="form-error" style={{ background: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

  <div className="section-card">

    <button
      className="primary-button"
      onClick={() => {
        setNewAttrName(attrName);
        setShowEditAttributeModal(true);
      }}
    >
      Edit Attribute Name
    </button>

  </div>

  <div className="section-card">
    <h3 className="section-header">Attribute Values</h3>

    <div className="filter-panel">
            <form onSubmit={handleValueSearchSubmit} class="filters-form">
              <input
                type="text"
                placeholder="Filter values by name..."
                value={valueSearchTerm}
                onChange={(e) => setValueSearchTerm(e.target.value)}
                className="filters-input"
              />
              
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <label>Created Date: </label>
                <input
                  type="date"
                  value={valueSearchDate}
                  onChange={(e) => setValueSearchDate(e.target.value)}
                  className="filters-input"
                />
              </div>
              
              <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
            </form>

            <div class="filters-form">
              <div>
                <label style={{marginRight: "5px" }}>Sort By: </label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
                  <option value="valueName">Value Name</option>
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

            <button className="primary-button" onClick={() => setShowAdd(true)}>
              Add New Value
            </button>
          </div>

{loadingValues ? (
            <p className="loading-text">Loading values...</p>
          ) : (
      <>
      <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>

      <tbody>
        {attributeValues.length === 0 ? (
          <tr>
            <td colSpan="3" className="table-empty">
              No values
            </td>
          </tr>
        ) : (
          attributeValues.map((v) => (
            <tr key={v.id}>
              <td>{v.valueName}</td>

              <td>
                <div className="table-actions">
                  <button
                    className="action-button"
                    onClick={() => {
                      setEditValue(v);
                      setEditValueName(v.valueName);
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
                    onClick={() => setDeleteValue(v)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
            <div className="paging-form">
                <button disabled={pageNum === 1} onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))} style={{ padding: "3px 7px" }}
        >
          &larr; Prev
                </button>
                <span>Page {pageNum}</span>
                <button disabled={attributeValues.length < pageSize} onClick={() => setPageNum((prev) => prev + 1)} style={{ padding: "3px 7px" }}
        >
          Next &rarr;
                </button>
              </div>
            </>
          )}
  </div>

  {showEditAttributeModal && (
    <div className="modal">
      <h4>Edit Attribute Name</h4>

      <input
        value={newAttrName}
        onChange={(e) => setNewAttrName(e.target.value)}
        maxLength={50}
      />

      <button onClick={saveAttrName}>Save</button>
      <button onClick={() => setShowEditAttributeModal(false)}>
        Cancel
      </button>
    </div>
  )}

  {editValue && (
    <div className="modal">
      <h4>Edit Value</h4>

      <input
        value={editValueName}
        onChange={(e) => setEditValueName(e.target.value)}
        maxLength={100}
      />

      <button onClick={saveValueEdit}>Save</button>
      <button onClick={() => setEditValue(null)}>
        Cancel
      </button>
    </div>
  )}

  {deleteValue && (
    <div className="modal">
      <p>
        Are you sure you want to delete
        <strong> {deleteValue.valueName}</strong>?
      </p>

      <button onClick={confirmDeleteValue}>Yes</button>
      <button onClick={() => setDeleteValue(null)}>
        No
      </button>
    </div>
  )}

  {showAdd && (
    <div className="modal">
      <h3>Add Value</h3>

      <input
        type="text"
        placeholder="Value name"
        value={addValueName}
        onChange={(e) => setAddValueName(e.target.value)}
        maxLength={100}
      />

      <button onClick={submitAdd}>Save</button>
      <button onClick={() => setShowAdd(false)}>Cancel</button>
    </div>
  )}

</div>

    </div>
  );
};

export default EditAttribute; 