import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_ITEM = "http://localhost:5204/api/item";
const API_COLL = "http://localhost:5204/api/collection";

function AddItem(){
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [collections, setCollections] = useState([]);

    const [form, setForm] = useState({
    itemName: "",
    description: "",
    collectionId: "",
    internationalId: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_COLL}/getcollections?pageNum=1&pageSize=100&sortBy=collName&sortDirection=0`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				});
      const data = await response.json();
      setCollections(data);
    } catch {
      setError("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };
   
  const submitItem = async () => {
    setError("");

    const response = await fetch(`${API_ITEM}/additem`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`  },
      body: JSON.stringify({
        Item_Name: form.itemName,
        Description: form.description,
        CollectionId: Number(form.collectionId),
        InternationalId: form.internationalId
      })
    });

    if (!response.ok) {
      setError("Failed to add item");
      return;
    }
    navigate("/items/all");
  };

if (loading) return <p className="loading-text">Loading...</p>;

return (
  <div>
    <div className="page-header">
      <button
        className="page-back"
        onClick={() => navigate("/items/all")}
      >
        ← Back
      </button>


    </div>
   
<div className="form-page">
   <h2 className="form-title">Add New Item</h2>

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
        <option value="">-- Select collection --</option>
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
      <button onClick={submitItem}>Add Item</button>
      <button onClick={() => navigate("/items/all")}>
        Cancel
      </button>
    </div>

</div>
    </div>
);


}

export default AddItem; 