import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/item";

function AllItems(){

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
    console.log(token); 
  const [searchName, setSearchName] = useState("");
  const [searchInterID, setSearchInterID] = useState("");

  const [appliedName, setAppliedName] = useState("");
  const [appliedInterID, setAppliedInterID] = useState("");
const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5); 
  const [sortBy, setSortBy] = useState("itemName");
  const [sortDirection, setSortDirection] = useState(0); 

  useEffect(() => {
    fetchItems();
  }, [pageNum, sortBy, sortDirection, appliedName, appliedInterID]);

    const fetchItems = async () => {
try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString(),
      });

      if (appliedName.trim() !== "") {
        params.append("itemName", appliedName.trim());
      }
      if (appliedInterID.trim() !== "") {
        params.append("interID", appliedInterID.trim());
      }

      const response = await fetch(`${API_URL}/getitems?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setError("Failed to fetch items data from server.");
        return;
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError("A network error occurred while loading museum catalog items.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); // Force return to page 1 on fresh search parameter sets
    setAppliedName(searchName);
    setAppliedInterID(searchInterID);
  };

    const deleteItem = async () => {
    const response = await fetch(
      `${API_URL}/deleteitem/${selectedItem.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
if (response.ok) {
        setShowDelete(false);
        setSelectedItem(null);
        
        if (items.length === 1 && pageNum > 1) {
          setPageNum((prev) => prev - 1);
        } else {
          fetchItems();
        }
      } else {
        alert("Failed to delete the selected tracking catalog item.");
      }  
  };


if (loading) {
  return <p className="loading-text">Loading items...</p>;
}

return (
  <div>

    <div className="page-header">
      <h2 className="page-title">Items</h2>

      <button
        className="primary-button"
        onClick={() => navigate("/items/add")}
      >
        Add New Item
      </button>
    </div>

<div className="filter-panel">
        <form onSubmit={handleFilterSubmit} class="filters-form">
          <input
            type="text"
            placeholder="Filter by Name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="filters-input"
          />
          <input
            type="text"
            placeholder="Filter by International ID..."
            value={searchInterID}
            onChange={(e) => setSearchInterID(e.target.value)}
            className="filters-input"
          />
          <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
        </form>

        <div class="filters-form">
          <div>
            <label style={{marginRight: "5px" }}>Sort By: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "6px", borderRadius: "4px" }} className="filters-select">
              <option value="itemName">Item Name</option>
              <option value="internationalID">International ID</option>
            </select>
          </div>

          <div>
            <label style={{marginRight: "5px" }}>Direction: </label>
            <select value={sortDirection} onChange={(e) => setSortDirection(Number(e.target.value))} style={{ padding: "6px", borderRadius: "4px" }} className="filters-select">
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
          <th>Name</th>
          <th>International ID</th>
          <th>Collection</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>

      <tbody>
        {items.length === 0 && (
          <tr>
            <td colSpan="5" className="table-empty">
              No items found
            </td>
          </tr>
        )}

        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.item_Name}</td>
            <td>{item.internationalID}</td>
            <td>{item.collectionName}</td>

            <td>
              <div className="table-actions">
                <button
                  className="action-button"
                  onClick={() =>
                    navigate(`/items/edit/${item.id}`)
                  }
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
                    setSelectedItem(item);
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
              onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}
              style={{ padding: "3px 7px" }}
        >
          &larr; Prev
            </button>
            <span>Page {pageNum}</span>
            <button 
              disabled={items.length < pageSize} 
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
          Delete item <strong>{selectedItem.item_Name}</strong>?
        </p>

        <button onClick={deleteItem}>Yes</button>
        <button onClick={() => setShowDelete(false)}>No</button>
      </div>
    )}

  </div>
);

}

export default AllItems; 