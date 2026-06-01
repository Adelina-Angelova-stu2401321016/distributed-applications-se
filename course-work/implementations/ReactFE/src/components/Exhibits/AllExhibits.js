import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/exhibit";

function AllExhibits(){
  
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [selectedExhibit, setSelectedExhibit] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  const [appliedSearchTitle, setAppliedSearchTitle] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5); 
  const [sortBy, setSortBy] = useState("title");
  const [sortDirection, setSortDirection] = useState(0); 
   
  useEffect(() => {
    fetchExhibits();
  }, [pageNum, sortBy, sortDirection, appliedSearchTitle, appliedStartDate, appliedEndDate]);

  const handleServerError = async (response, fallbackMessage) => {
    try {
      const errorData = await response.json();
      setError(errorData.message || fallbackMessage);
    } catch {
      setError(fallbackMessage);
    }
  };

  const fetchExhibits = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString(),
      });

      if (appliedSearchTitle.trim() !== "") {
        params.append("title", appliedSearchTitle.trim());
      }

      if (appliedStartDate !== "") {
        params.append("startDate", appliedStartDate);
      }

      if (appliedEndDate !== "") {
        params.append("endDate", appliedEndDate);
      }

      const response = await fetch(`${API_URL}/getexhibits?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleServerError(response, "Failed to retrieve records.");
        return;
      }

      const data = await response.json();
      setExhibits(data);
    } catch (err) {
      setError("Network error: Server communication dropped.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); 
    setAppliedSearchTitle(searchTitle);
    setAppliedStartDate(searchStartDate);
    setAppliedEndDate(searchEndDate);
  };

  const deleteExhibit = async () => {
    setError(""); 
    try{
      const response =     await fetch(
      `${API_URL}/delete-exhibit/${selectedExhibit.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (!response.ok) {
        await handleServerError(response, "Failed to completely drop specified exhibit record.");
        return;
      }
      setShowDelete(false);
    setSelectedExhibit(null);
    if (exhibits.length === 1 && pageNum > 1) {
        setPageNum((prev) => prev - 1);
      } else {
        fetchExhibits();
      }
   }catch (err) {
      setError("Network error while trying to process item deletion.");
    }
  };

const formatDateString = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yy = String(date.getFullYear()).slice(-2);

      return `${dd} / ${mm} / ${yy}`;
    } catch {
      return dateString;
    }
  };


  if (loading) {
    return <p>Loading exhibits...</p>;
  }

  return (
    <div>
     <div className="page-header">
    <h2 className="page-title">Exhibits</h2>

    <button
      className="primary-button"
      onClick={() => navigate("/exhibits/add")}
    >
      Add New Exhibit
    </button>
  </div>

     <div className="filter-panel">
        <form onSubmit={handleSearchSubmit} class="filters-form">
          <input
            type="text"
            placeholder="Exhibit Name"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="filters-input"
          />

          <div>
            <label style={{marginRight: "5px" }}>Start Date: </label>
            <input
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              className="filters-input"
            />
          </div>

          <div>
            <label style={{marginRight: "5px" }}>End Date: </label>
            <input
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              className="filters-input"
            />
          </div>

          <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Search</button>
        </form>

        <div class="filters-form">
          <div>
            <label style={{marginRight: "5px" }}>Sort By: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
              <option value="title">Title</option>
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
        <div className="form-error" style={{ background: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}


  <table className="data-table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>Entry Price</th>
        <th>Curator</th>
        <th>Edit</th>
        <th>Delete</th>
      </tr>
    </thead>

    <tbody>
      {exhibits.length === 0 && (
        <tr>
          <td colSpan="7" className="table-empty">
            No exhibits found
          </td>
        </tr>
      )}

      {exhibits.map((exhibit) => (
        <tr key={exhibit.id}>
          <td>{exhibit.title}</td>
          <td>{formatDateString(exhibit.start_Date)}</td>
          <td>{formatDateString(exhibit.end_Date)}</td>
          <td>{exhibit.entry_Price}</td>
          <td>{exhibit.curator}</td>

          <td>
            <div className="table-actions">
              <button
                className="action-button"
                onClick={() =>
                  navigate(`/exhibits/edit/${exhibit.id}`)
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
                  setSelectedExhibit(exhibit);
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
            <button disabled={pageNum === 1} onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))} style={{ padding: "3px 7px" }}>
              &larr; Prev
            </button>
            <span>Page {pageNum}</span>
            <button disabled={exhibits.length < pageSize} onClick={() => setPageNum((prev) => prev + 1)}style={{ padding: "3px 7px" }}>
             Next &rarr;
            </button>
  </div>

  {showDelete && (
    <div className="modal">
      <h3>Are you sure?</h3>

      <p>
        Delete exhibit <strong>{selectedExhibit.title}</strong>?
      </p>

      <button onClick={deleteExhibit}>Yes</button>
      <button onClick={() => setShowDelete(false)}>No</button>
    </div>
  )}
    </div>
  );

}

export default AllExhibits; 
