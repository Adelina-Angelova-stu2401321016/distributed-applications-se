import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/partner";

function AllPartners(){
    const navigate = useNavigate();
    const [partners, setPartners] = useState([]);
      const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
      const [showDelete, setShowDelete] = useState(false);
      const [selectedPartner, setSelectedPartner] = useState(null);
    const token = localStorage.getItem("token");
      const [searchName, setSearchName] = useState("");
  const [searchVat, setSearchVat] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [appliedVat, setAppliedVat] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5); 
  const [sortBy, setSortBy] = useState("partnerName");
  const [sortDirection, setSortDirection] = useState(0); 

   useEffect(() => {
    fetchPartners();
  }, [pageNum, sortBy, sortDirection, appliedName, appliedVat]);

  const fetchPartners = async () => {
 try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString()
      });

      if (appliedName.trim() !== "") {
        params.append("partnerName", appliedName.trim());
      }
      if (appliedVat.trim() !== "") {
        params.append("vat", appliedVat.trim());
      }

      const response = await fetch(`${API_URL}/getpartners?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Network error`);
      }

      const data = await response.json();
      setPartners(data);
    } catch (err) {
      console.error(err);
      setError("Network error");
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };
const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); 
    setAppliedName(searchName);
    setAppliedVat(searchVat);
  };
    const deletePartner = async () => {
      try{
        const response =     await fetch(
      `${API_URL}/deletepartner/${selectedPartner.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
       if (response.ok) {
        setShowDelete(false);
        setSelectedPartner(null);
        
        if (partners.length === 1 && pageNum > 1) {
          setPageNum((prev) => prev - 1);
        } else {
          fetchPartners();
        }
      } else {
        alert("Network error.");
      }
    } catch (err) {
      console.error(err);
    }
  };


  if (loading) {
    return <p className="loading-text">Loading partners...</p>;
  }

    return(
    <div>

  <div className="page-header">
    <div>
      <button
        className="action-button"
        onClick={() => navigate("/partners/types")}
      >
        Partner Types
      </button>
    </div>

    <button
      className="primary-button"
      onClick={() => navigate("/partners/add")}
    >
      Add New Partner
    </button>
  </div>

  <h2 className="page-title">Partners</h2>

<div className="filter-panel">
        <form onSubmit={handleSearchSubmit} class="filters-form">
          <input
            type="text"
            placeholder="Search Partner Name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="filters-input"
          />

          <input
            type="text"
            placeholder="Search VAT..."
            value={searchVat}
            onChange={(e) => setSearchVat(e.target.value)}
            className="filters-input"
          />

          <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
        </form>

        <div class="filters-form">
          <div>
            <label style={{marginRight: "5px" }}>Sort Field: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
              <option value="partnerName">Partner Name</option>
              <option value="vat">VAT Code</option>
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
        <div style={{ color: "red", padding: "10px", background: "#fde8e8", borderRadius: "4px", marginBottom: "15px", fontWeight: "bold" }}>
          {error}
        </div>
      )}


  <table className="data-table">
    <thead>
      <tr>
        <th>Partner Name</th>
        <th>VAT</th>
        <th>Partner Type</th>
        <th>Edit</th>
        <th>Delete</th>
      </tr>
    </thead>

    <tbody>
      {partners.length === 0 && (
        <tr>
          <td colSpan="5" className="table-empty">
            No partners found
          </td>
        </tr>
      )}

      {partners.map((partner) => (
        <tr key={partner.id}>
          <td>{partner.partnerName}</td>
          <td>{partner.vat}</td>
          <td>{partner.typeName}</td>

          <td>
            <div className="table-actions">
              <button
                className="action-button"
                onClick={() =>
                  navigate(`/partners/edit/${partner.id}`)
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
                  setSelectedPartner(partner);
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
              &larr; Previous
            </button>
            <span>Page {pageNum}</span>
            <button 
              disabled={partners.length < pageSize} 
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
        Delete partner <strong>{selectedPartner.partnerName}</strong>?
      </p>

      <button onClick={deletePartner}>Yes</button>
      <button onClick={() => setShowDelete(false)}>No</button>
    </div>
  )}

</div>

    );
 
}

export default AllPartners; 