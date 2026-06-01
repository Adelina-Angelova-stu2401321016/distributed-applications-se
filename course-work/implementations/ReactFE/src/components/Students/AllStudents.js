import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/student";

function AllStudents(){
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const token = localStorage.getItem("token");
const [error, setError] = useState("");
const [searchStudentName, setSearchStudentName] = useState("");
  const [searchPartnerName, setSearchPartnerName] = useState("");

  const [appliedStudentName, setAppliedStudentName] = useState("");
  const [appliedPartnerName, setAppliedPartnerName] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState("fName");
  const [sortDirection, setSortDirection] = useState(0);

useEffect(() => {
    fetchStudents();
  }, [pageNum, sortBy, sortDirection, appliedStudentName, appliedPartnerName]);
        
const fetchStudents = async () => {
   try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString()
      });

      if (appliedStudentName.trim() !== "") {
        params.append("studentName", appliedStudentName.trim());
      }
      if (appliedPartnerName.trim() !== "") {
        params.append("partnerName", appliedPartnerName.trim());
      }

      const response = await fetch(`${API_URL}/getstudents?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned error status code: ${response.status}`);
      }

      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve matching student collection files.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
};
    const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); // Return viewframe scope index back to start
    setAppliedStudentName(searchStudentName);
    setAppliedPartnerName(searchPartnerName);
  };

    const deleteStudent = async () => {
      try{
          const response =          await fetch(
            `${API_URL}/deletestudent/${selectedStudent.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
 if (response.ok) {
        setShowDelete(false);
        setSelectedStudent(null);

        if (students.length === 1 && pageNum > 1) {
          setPageNum((prev) => prev - 1);
        } else {
          //fetchRooms(); 
          fetchStudents();
        }
      } else {
        alert("Server failed to fulfill database deletion parameter checks.");
      }
      }catch (err) {
      console.error(err);
    } 
 };

      if (loading) {
    return <p>Loading students...</p>;
  }

    return(
    <div>
   <div>

  <div className="page-header">
    <h2 className="page-title">Students</h2>

    <button
      className="primary-button"
      onClick={() => navigate("/students/add")}
    >
      Add New Student
    </button>
  </div>
      <div className="filter-panel">
        <form onSubmit={handleFilterSubmit} class="filters-form">
          <input
            type="text"
            placeholder="Filter Student Name..."
            value={searchStudentName}
            onChange={(e) => setSearchStudentName(e.target.value)}
            className="filters-input"
          />
          <input
            type="text"
            placeholder="Filter Organisation..."
            value={searchPartnerName}
            onChange={(e) => setSearchPartnerName(e.target.value)}
            className="filters-input"
          />
          <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
        </form>
        <div class="filters-form">
          <div>
            <label style={{marginRight: "5px" }}>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
              <option value="fName">First Name</option>
              <option value="lName">Last Name</option>
              <option value="partnerName">Organisation / Partner</option>
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
        <th>Name</th>
        <th>Organisation</th>
        <th>Edit</th>
        <th>Delete</th>
      </tr>
    </thead>

    <tbody>
      {students.length === 0 && (
        <tr>
          <td colSpan="4" className="table-empty">
            No students found
          </td>
        </tr>
      )}

      {students.map((student) => (
        <tr key={student.id}>
          <td>{student.fullName}</td>
          <td>{student.partnerName}</td>

          <td>
            <div className="table-actions">
              <button
                className="action-button"
                onClick={() =>
                  navigate(`/students/edit/${student.id}`)
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
                  setSelectedStudent(student);
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
              disabled={students.length < pageSize}
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
        Delete student <strong>{selectedStudent.fullName}</strong>?
      </p>

      <button onClick={deleteStudent}>Yes</button>
      <button onClick={() => setShowDelete(false)}>No</button>
    </div>
  )}

</div>

    </div>
  );

}

export default AllStudents; 
