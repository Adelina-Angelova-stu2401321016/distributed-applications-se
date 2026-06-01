import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5204/api";

function EditItem(){

  const { id } = useParams();
  const navigate = useNavigate();

   const token = localStorage.getItem("token");
    const [collections, setCollections] = useState([]);
    const [attributeValues, setAttributeValues] = useState([]);
    const [deleteValue, setDeleteValue] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

const [attributes, setAttributes] = useState([]);
const [selectedAttributeId, setSelectedAttributeId] = useState("");
const [attrValuesForAttr, setAttrValuesForAttr] = useState([]);
const [selectedValueId, setSelectedValueId] = useState("");
 
    const [form, setForm] = useState({
    id: "",
    itemName: "",
    description: "",
    collectionId: "",
    internationalId: ""
  });

   const [searchAttrName, setSearchAttrName] = useState("");
  const [searchValueName, setSearchValueName] = useState("");

  const [appliedAttrName, setAppliedAttrName] = useState("");
  const [appliedValueName, setAppliedValueName] = useState("");

  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(3); 
  const [sortBy, setSortBy] = useState("attrName");
  const [sortDirection, setSortDirection] = useState(0);

    useEffect(() => {
    loadData();
  }, []);

useEffect(() => {
    if (id) {
      fetchValues();
    }
  }, [id, pageNum, sortBy, sortDirection, appliedAttrName, appliedValueName]);

    const loadData = async () => {
    try {
     setLoading(true); 
      const [itemRes, collectionsRes, iavsRes] = await Promise.all([
        fetch(`${API_URL}/item/getitem/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				}),
        fetch(`${API_URL}/collection/getcollections?pageNum=1&pageSize=100&sortBy=collName&sortDirection=0`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				})
      ]);

      if (!itemRes.ok) throw new Error("Failed to load item");
      if (!collectionsRes.ok) throw new Error("Failed to load collections");
     

      const item = await itemRes.json();
      const collectionsData = await collectionsRes.json();
      

      setCollections(collectionsData);
     

      setForm({
        id: item.id,
        itemName: item.itemName,
        description: item.description,
        collectionId: item.collectionID, 
        internationalId: item.internationalID
      });
      console.log(item);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchValues = async () => {
    try {
      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString()
      });

      if (appliedAttrName.trim() !== "") {
        params.append("attrName", appliedAttrName.trim());
      }
      if (appliedValueName.trim() !== "") {
        params.append("valueName", appliedValueName.trim());
      }

      const res = await fetch(
        `${API_URL}/itemattrvalue/getitem-attrvalues/${id}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error();
      const data = await res.json();
      
      setAttributeValues(data);
    } catch {
      setError("Failed to load attribute values");
    }
  };
const handleAttributeFilterSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); // Reset back to first page upon fresh search execution
    setAppliedAttrName(searchAttrName);
    setAppliedValueName(searchValueName);
  };

  useEffect(() => {
  if (showAddModal) {
    fetchAttributes();
  }
}, [showAddModal]);

const fetchAttributes = async () => {
  try {
    const res = await fetch(`${API_URL}/attribute/getattributes?pageNum=1&pageSize=100&sortBy=attrName&sortDirection=0`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json(); 
    console.log(data); 
    setAttributes(data);
    
  } catch {
    setError("Failed to load attributes");
  }
};

useEffect(() => {
  if (selectedAttributeId) {
    fetchAttributeValues(selectedAttributeId);
  }
}, [selectedAttributeId]);

const fetchAttributeValues = async (attrId) => {
  try {
    const res = await fetch(
      `${API_URL}/attribute/getattr-values/${attrId}?pageNum=1&pageSize=100&sortBy=dtCreated&sortDirection=0`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    console.log(data);
      setAttrValuesForAttr(data);
  } catch {
    setError("Failed to load attribute values");
  }
};

    const submitUpdate = async () => {
    setError("");

    const response = await fetch(
      `${API_URL}/item/edititem`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ID: Number(form.id),
          Item_Name: form.itemName,
          Description: form.description,
          CollectionID: Number(form.collectionId),
          InternationalID: form.internationalId
        })
      }
    );

    if (!response.ok) {
      setError("Failed to update item");
      return;
    }

    navigate("/items/all");
  };

  const submitAddAttribute = async () => {
  if (!selectedValueId) return;

  const res = await fetch(
    `${API_URL}/itemattrvalue/additem-attrvalue`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ItemID: Number(id),
        AttrValueID: Number(selectedValueId)
      })
    }
  );

  if (!res.ok) {
    setError("Failed to add attribute");
    return;
  }

      setShowAddModal(false);
    setSelectedAttributeId("");
    setSelectedValueId("");
    setAttrValuesForAttr([]);
    setPageNum(1);
    fetchValues();
};


  const confirmDeleteValue = async () => {
    await fetch(
      `${API_URL}/itemattrvalue/deleteitem-attrvalue/${deleteValue.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setDeleteValue(null);
    if (attributeValues.length === 1 && pageNum > 1) {
      setPageNum((prev) => prev - 1);
    } else {
      fetchValues();
    }
  };

  if (loading) return <p>Loading...</p>;

  return(
    <div>
        <div className="page-header">
      <button
        className="page-back"
        onClick={() => navigate("/items/all")}
      >
        ← Back
      </button>


    </div>
  <div className="mixed-page">

    {/* ===== Header ===== */}
    <div className="page-header">

      <h2 className="page-title">Edit Item</h2>
    </div>

    {/* ===== Item Form ===== */}
    <div className="section-card">

      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label>Item Name</label>
        <input
          type="text"
          value={form.itemName}
          onChange={(e) =>
            setForm({ ...form, itemName: e.target.value })
          }
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label>Collection</label>
        <select
          value={form.collectionId}
          onChange={(e) =>
            setForm({ ...form, collectionId: e.target.value })
          }
        >
          <option value="">-Collections-</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.collName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>International ID</label>
        <input
          type="text"
          value={form.internationalId}
          onChange={(e) =>
            setForm({ ...form, internationalId: e.target.value })
          }
          maxLength={255}
        />
      </div>

      <div className="form-actions">
        <button onClick={submitUpdate}>Save</button>
        <button onClick={() => navigate("/items/all")}>
          Cancel
        </button>
      </div>

    </div>

    {/* ===== Attribute Relationship Section ===== */}
    <div className="section-card">
      <h3 className="section-header">Item Attributes</h3>

      <button
        className="primary-button"
        onClick={() => setShowAddModal(true)}
      >
        Add Attribute
      </button>
<div className="filter-panel">
            <form onSubmit={handleAttributeFilterSubmit} class="filters-form">
              <input
                type="text"
                placeholder="Filter Attribute..."
                value={searchAttrName}
                onChange={(e) => setSearchAttrName(e.target.value)}
                className="filters-input"
              />
              <input
                type="text"
                placeholder="Filter Value..."
                value={searchValueName}
                onChange={(e) => setSearchValueName(e.target.value)}
                className="filters-input"
              />
              <button type="submit" style={{ padding: "5px 10px" }}>Search</button>
            </form>

            <div class="filters-form">
              <div>
             <label style={{marginRight: "5px" }}>Sort By:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
                <option value="attrName">Attribute Name</option>
                <option value="valueName">Value Name</option>
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

      <table className="data-table">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Value</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {attributeValues.length === 0 ? (
            <tr>
              <td colSpan="3" className="table-empty">
                No attributes
              </td>
            </tr>
          ) : (
            attributeValues.map((v) => (
              <tr key={v.id}>
                <td>{v.attrName}</td>
                <td>{v.valueName}</td>
                <td>
                  <button
                    className="action-button danger"
                    onClick={() => setDeleteValue(v)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
        <div className="paging-form">
            <button disabled={pageNum === 1} onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))} style={{ padding: "3px 7px" }}> 
              &larr; Prev
            </button>
            <span>Page {pageNum}</span>
            <button disabled={attributeValues.length < pageSize} onClick={() => setPageNum((prev) => prev + 1)} style={{ padding: "3px 7px" }}>
              Next &rarr;
            </button>
          </div>
    </div>

    {/* ===== Add Attribute Modal ===== */}
    {showAddModal && (
      <div className="modal">
        <h4>Add Attribute</h4>

        <div className="form-group" >
          <label>Attribute</label>
          <select
            value={selectedAttributeId}
            onChange={(e) =>
              setSelectedAttributeId(e.target.value)
            }
            style={{ width: "300px", maxWidth: "300px", boxSizing: "border-box", padding: "8px" }}
          >
            <option value="">-Select Attribute-</option>
            {attributes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.attrName}                
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Value</label>
          <select
            value={selectedValueId}
            onChange={(e) =>
              setSelectedValueId(e.target.value)
            }
            disabled={!attrValuesForAttr.length}
            style={{ width: "300px", maxWidth: "300px", boxSizing: "border-box", padding: "8px" }}
          >
            <option value="">-Select Value-</option>
            {attrValuesForAttr.map((v) => (
              <option key={v.id} value={v.id}>
                {v.valueName}
              </option>
            ))}
          </select>
        </div>

        <button onClick={submitAddAttribute}>Add</button>
        <button onClick={() => setShowAddModal(false)}>
          Cancel
        </button>
      </div>
    )}

    {/* ===== Delete Attribute Modal ===== */}
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

  </div>

    </div>
  ); 
}

export default EditItem; 