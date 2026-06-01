import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/study";

function AllStudies(){
const navigate = useNavigate();
    const [studies, setStudies] = useState([]);
      const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
            const [showDelete, setShowDelete] = useState(false);
            const [selectedStudy, setSelectedStudy] = useState(null);
          const token = localStorage.getItem("token");
  const [searchStudyName, setSearchStudyName] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");

  const [appliedStudyName, setAppliedStudyName] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState("studyName");
  const [sortDirection, setSortDirection] = useState(0);

useEffect(() => {
    fetchStudies();
  }, [pageNum, sortBy, sortDirection, appliedStudyName, appliedStartDate]);
      
        const fetchStudies = async () => {
   try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString()
      });

      if (appliedStudyName.trim() !== "") {
        params.append("studyName", appliedStudyName.trim());
      }
      if (appliedStartDate !== "") {
        params.append("startDate", appliedStartDate);
      }

      const response = await fetch(`${API_URL}/getstudies?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned error validation status: ${response.status}`);
      }

      const data = await response.json();
      setStudies(data);
    } catch (err) {
      console.error(err);
      setError("Failed to sync structural study matrix items.");
      setStudies([]);
    } finally {
      setLoading(false);
    }
 };
 const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); 
    setAppliedStudyName(searchStudyName);
    setAppliedStartDate(searchStartDate);
  };

const deleteStudy = async () => {
  try{
    const response =           await fetch(
            `${API_URL}/deletestudy/${selectedStudy.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
 if (response.ok) {
        setShowDelete(false);
        setSelectedStudy(null);

        if (studies.length === 1 && pageNum > 1) {
          setPageNum((prev) => prev - 1);
        } else {
          fetchStudies();
        }
      } else {
        alert("Server validation error rejected deletion protocol parameters.");
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
  return <p className="loading-text">Loading studies...</p>;
}

return (
  <div>

    <div className="page-header">
      <h2 className="page-title">Studies</h2>

      <button
        className="primary-button"
        onClick={() => navigate("/studies/add")}
      >
        Add New Study
      </button>
    </div>

 <div className="filter-panel">
        <form onSubmit={handleFilterSubmit} class="filters-form">
          <input
            type="text"
            placeholder="Filter Study Name..."
            value={searchStudyName}
            onChange={(e) => setSearchStudyName(e.target.value)}
           className="filters-input"
          />
          <label style={{marginRight: "5px" }}>Start Date:</label>
          <input
            type="date"
            title="Start Date Filter"
            value={searchStartDate}
            onChange={(e) => setSearchStartDate(e.target.value)}
            className="filters-input"
          />
          <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
        </form>
     <div class="filters-form">
          <div>
            <label style={{marginRight: "5px" }}>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
              <option value="studyName">Study Name</option>
              <option value="startDate">Start Date</option>
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

      {error && (
        <div style={{ color: "red", padding: "10px", background: "#fde8e8", borderRadius: "4px", marginBottom: "15px", fontWeight: "bold" }}>
          {error}
        </div>
      )}


    <table className="data-table">
      <thead>
        <tr>
          <th>Study</th>
          <th>Description</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>

      <tbody>
        {studies.length === 0 && (
          <tr>
            <td colSpan="7" className="table-empty">
              No studies found
            </td>
          </tr>
        )}

        {studies.map((study) => (
          <tr key={study.id}>
            <td>{study.studyName}</td>
            <td>{study.description}</td>
            <td>{formatDate(study.startDate)}</td>
            <td>{formatDate(study.endDate)}</td>
            <td>{study.status}</td>

            <td>
              <div className="table-actions">
                <button
                  className="action-button"
                  onClick={() =>
                    navigate(`/studies/edit/${study.id}`)
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
                    setSelectedStudy(study);
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
              disabled={studies.length < pageSize}
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
          Delete study <strong>{selectedStudy.studyName}</strong>?
        </p>

        <button onClick={deleteStudy}>Yes</button>
        <button onClick={() => setShowDelete(false)}>No</button>
      </div>
    )}

  </div>
);

}

export default AllStudies; 