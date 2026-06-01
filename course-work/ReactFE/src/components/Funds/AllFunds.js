import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/fund";

function AllFunds(){
    const navigate = useNavigate();
        const [funds, setFunds] = useState([]);
          const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
                const [showDelete, setShowDelete] = useState(false);
                const [selectedFund, setSelectedFund] = useState(null);
              const token = localStorage.getItem("token");
         
         const [searchStudyName, setSearchStudyName] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
    const [appliedStudyName, setAppliedStudyName] = useState("");
  const [appliedAmount, setAppliedAmount] = useState("");

  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5); 
  const [sortBy, setSortBy] = useState("studyName");
  const [sortDirection, setSortDirection] = useState(0); 

  useEffect(() => {
    fetchFunds();
  }, [pageNum, sortBy, sortDirection, appliedStudyName, appliedAmount]);
        
  const fetchFunds = async () => {
     try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString(),
      });

      if (appliedStudyName.trim() !== "") {
        params.append("studyName", appliedStudyName.trim());
      }

      if (appliedAmount.trim() !== "" && !isNaN(appliedAmount)) {
        params.append("amount", appliedAmount.trim());
      }

      const response = await fetch(`${API_URL}/getfunds?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setError("Failed to fetch funds data from the server.");
        return;
      }

      const data = await response.json();
      setFunds(data);
    } catch (err) {
      setError("A network error occurred while loading funds.");
    } finally {
      setLoading(false);
    }
  };
    const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); // Reset back to the first page on a new search filter sequence
    setAppliedStudyName(searchStudyName);
    setAppliedAmount(searchAmount);
  };

  const deleteFund = async () => {
  try{
    const response =  await fetch(
                `${API_URL}/deletefund/${selectedFund.id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
    if (response.ok) {
       setShowDelete(false);
        setSelectedFund(null);
        
        if (funds.length === 1 && pageNum > 1) {
          setPageNum((prev) => prev - 1);
        } else {
          fetchFunds();
        }
      } else {
        alert("Failed to delete the selected fund record.");
      }
  }catch (err) {
      console.error("Error deleting fund:", err);
    }
};

  const formatDate = (rawDate) => {
    if (!rawDate) return "";
    try {
      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return rawDate;

      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yy = String(date.getFullYear()).slice(-2);

      return `${dd} / ${mm} / ${yy}`;
    } catch {
      return rawDate;
    }
  };


          if (loading) {
    return <p>Loading funds...</p>;
  }

  return(
<div>

  <div className="page-header">
    <h2 className="page-title">Funds</h2>

    <button
      className="primary-button"
      onClick={() => navigate("/funds/add")}
    >
      Make Funding Request
    </button>
  </div>

<div className="filter-panel">
        <form onSubmit={handleSearchSubmit} class="filters-form">
          <input
            type="text"
            placeholder="Search by Study Receiver..."
            value={searchStudyName}
            onChange={(e) => setSearchStudyName(e.target.value)}
            className="filters-input"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Filter by Amount..."
            value={searchAmount}
            onChange={(e) => setSearchAmount(e.target.value)}
            className="filters-input"
          />
          <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
        </form>

        <div class="filters-form">
          <div>
            <label style={{marginRight: "5px" }}>Sort By: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
              <option value="studyName">Study Receiver</option>
              <option value="amount">Amount</option>
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
        <th>Date</th>
        <th>Organisation</th>
        <th>Amount</th>
        <th>Currency</th>
        <th>Reason</th>
        <th>Study Receiver</th>
        <th>Edit</th>
        <th>Delete</th>
      </tr>
    </thead>

    <tbody>
      {funds.length === 0 && (
        <tr>
          <td colSpan="9" className="table-empty">
            No funds found
          </td>
        </tr>
      )}

      {funds.map((fund) => (
        <tr key={fund.id}>
          <td>{formatDate(fund.dt)}</td>
          <td>{fund.partnerName}</td>
          <td>{fund.amount}</td>
          <td>{fund.currency}</td>
          <td>{fund.reason}</td>
          <td>{fund.studyName}</td>

          <td>
            <div className="table-actions">
              <button
                className="action-button"
                onClick={() =>
                  navigate(`/funds/edit/${fund.id}`)
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
                  setSelectedFund(fund);
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
            <button disabled={funds.length < pageSize} onClick={() => setPageNum((prev) => prev + 1)} style={{ padding: "3px 7px" }}
        >
          Next &rarr;
            </button>
   </div>
   
  {showDelete && (
    <div className="modal">
      <h3>Are you sure?</h3>

      <p>
        Delete fund <strong>{selectedFund.id}</strong>?
      </p>

      <button onClick={deleteFund}>Yes</button>
      <button onClick={() => setShowDelete(false)}>No</button>
    </div>
  )}

</div>

  );
}

export default AllFunds; 
