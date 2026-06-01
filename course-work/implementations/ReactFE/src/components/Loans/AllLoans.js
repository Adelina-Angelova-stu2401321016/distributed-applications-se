
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";


const API_URL = "http://localhost:5204/api/loan";

function AllLoans(){
    
const navigate = useNavigate();
    const [loans, setLoans] = useState([]);
      const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [error, setError] = useState("");
      const roleId = Number(user.roleId);
      const ADMIN_ROLE_ID = 100001;   
       const isAdmin = roleId === ADMIN_ROLE_ID;
      const [showDelete, setShowDelete] = useState(false);
      const [selectedLoan, setSelectedLoan] = useState(null);
    const token = localStorage.getItem("token");
    const [searchType, setSearchType] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [appliedType, setAppliedType] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5); 
  const [sortBy, setSortBy] = useState("startDate");
  const [sortDirection, setSortDirection] = useState(0); 

  useEffect(() => {
    fetchLoans();
  }, [pageNum, sortBy, sortDirection, appliedType, appliedDate]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString(),
      });

      if (appliedType !== "") {
        params.append("loanType", appliedType);
      }
      if (appliedDate !== "") {
        params.append("startDate", appliedDate);
      }

      const response = await fetch(`${API_URL}/getloans?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setError("Didn't get em.");
        return;
      }

      const data = await response.json();
      setLoans(data);
    } catch (err) {
      console.error(err);
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

   const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); 
    setAppliedType(searchType);
    setAppliedDate(searchDate);
  };

    const deleteLoan = async () => {
      try{
        const response = await fetch(
      `${API_URL}/deleteloan/${selectedLoan.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
     if (response.ok) {
        setShowDelete(false);
        setSelectedLoan(null);
        
        if (loans.length === 1 && pageNum > 1) {
          setPageNum((prev) => prev - 1);
        } else {
          fetchLoans();
        }
      } else {
        alert("Network error");
      }
    } catch (err) {
      console.error(err);
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
    return <p>Loading loans...</p>;
  }

  return(
    <div><div>

  <div className="page-header">
    <h2 className="page-title">Loans</h2>

    {isAdmin && (
      <button
        className="primary-button"
        onClick={() => navigate("/loans/add")}
      >
        Add New Loan
      </button>
    )}
  </div>

      <div className="filter-panel">
        <form onSubmit={handleSearchSubmit} class="filters-form">
          
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="filters-select"
          >
            <option value="">- All Loan Types -</option>
            <option value="o">Outgoing</option>
            <option value="i">Incoming</option>
          </select>
          <label style={{marginRight: "5px" }}>Start Date: </label>
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="filters-input"
          />

          <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Search</button>
        </form>

        <div class="filters-form">
          <div>
            <label style={{marginRight: "5px" }}>Sort By: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
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
        <th>Partner</th>
        <th>Loan Type</th>
        <th>Status</th>
        <th>Start</th>
        <th>End</th>
        {isAdmin && <th>Edit</th>}
        {isAdmin && <th>Delete</th>}
      </tr>
    </thead>

    <tbody>
      {loans.length === 0 && (
        <tr>
          <td
            colSpan={isAdmin ? 8 : 6}
            className="table-empty"
          >
            No loans found
          </td>
        </tr>
      )}

      {loans.map((loan) => (
        <tr key={loan.id}>
          <td>{loan.partnerName}</td>
          <td>{loan.loanType}</td>
          <td>{loan.status}</td>
          <td>{formatDate(loan.startDate)}</td>
          <td>{formatDate(loan.endDate)}</td>

          {isAdmin && (
            <td>
              <div className="table-actions">
                <button
                  className="action-button"
                  onClick={() =>
                    navigate(`/loans/edit/${loan.id}`)
                  }
                >
                  Edit
                </button>
              </div>
            </td>
          )}

          {isAdmin && (
            <td>
              <div className="table-actions">
                <button
                  className="action-button danger"
                  onClick={() => {
                    setSelectedLoan(loan);
                    setShowDelete(true);
                  }}
                >
                  Delete
                </button>
              </div>
            </td>
          )}
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
              disabled={loans.length < pageSize} 
              onClick={() => setPageNum((prev) => prev + 1)}
             style={{ padding: "3px 7px" }}
        >
          Next &rarr;
            </button>
  </div>

  {showDelete && isAdmin && (
    <div className="modal">
      <h3>Are you sure?</h3>

      <p>
        Delete loan <strong>{selectedLoan.id}</strong> from{" "}
        <strong>{selectedLoan.partnerName}</strong>?
      </p>

      <button onClick={deleteLoan}>Yes</button>
      <button onClick={() => setShowDelete(false)}>No</button>
    </div>
  )}

</div>

    </div>
  ); 
}

export default AllLoans; 