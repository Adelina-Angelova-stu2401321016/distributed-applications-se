import { useEffect, useState } from "react";
import { useNavigate,useParams } from "react-router-dom";

const API_URL = "http://localhost:5204/api";

function EditStudy(){
    const navigate = useNavigate();
    const { id } = useParams();

        const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studyResearchers, setStudyResearchers] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [selectedResearcherId, setSelectedResearcherId] = useState("");
  const [students, setStudents] = useState([]);
const [showAddStudentModal, setShowAddStudentModal] = useState(false);
const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

const [availableStudents, setAvailableStudents] = useState([]);
const [selectedStudentId, setSelectedStudentId] = useState("");
const [studentToDelete, setStudentToDelete] = useState(null);
const [resPageNum, setResPageNum] = useState(1);
  const [resPageSize] = useState(3);
  const [resSortBy, setResSortBy] = useState("lName");
  const [resSortDirection, setResSortDirection] = useState(0);
  const [searchResName, setSearchResName] = useState("");
  const [appliedResName, setAppliedResName] = useState("");
  const [studPageNum, setStudPageNum] = useState(1);
  const [studPageSize] = useState(3);
  const [studSortBy, setStudSortBy] = useState("lName");
  const [studSortDirection, setStudSortDirection] = useState(0);
  const [searchStudName, setSearchStudName] = useState("");
  const [searchPartnerName, setSearchPartnerName] = useState("");
  const [appliedStudName, setAppliedStudName] = useState("");
  const [appliedPartnerName, setAppliedPartnerName] = useState("");



    const [form, setForm] = useState({
    id: "",
    studyName: "",
    description: "",
    startDate: "",
    endDate: ""
    });

  useEffect(() => {
    fetchStudyResearchers();
  }, [id, resPageNum, resSortBy, resSortDirection, appliedResName]);

 useEffect(() => {
    fetchStudents();
  }, [id, studPageNum, studSortBy, studSortDirection, appliedStudName, appliedPartnerName]);

useEffect(() => {
    fetchStudy();
    fetchResearchers();
  }, [id]);



    const fetchResearchers = async () => {
      try {
        const response = await fetch(`${API_URL}/users/getresearchers`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setResearchers(data);
      } catch {
        setError("Failed to load researchers");
        
      } finally {
        setLoading(false);
      }
    };
const fetchAvailableStudents = async () => {
  try {
 const params = new URLSearchParams({
        pageNum: "1",
        pageSize: "100", 
        sortBy: "fName",
        sortDirection: "0"
      });
    const res = await fetch(
      `${API_URL}/student/getstudents?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      setError("Failed to load students");
      return;
    }

    const data = await res.json();
    setAvailableStudents(data);
  } catch {
    setError("Failed to load students");
  }
};

useEffect(() => {
  if (showAddStudentModal) {
    fetchAvailableStudents();
  }
}, [showAddStudentModal]);

const fetchStudy = async () => {
    try {
      const response = await fetch(
        `${API_URL}/study/getstudy/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        setError("Failed to load study");
        return;
      }

      const data = await response.json();

      setForm({
        id: data.id,
        studyName: data.studyName,
        startDate: data.startDate?.split("T")[0],
        endDate: data.endDate?.split("T")[0],
        description: data.description
      });
    } catch {
      setError("Failed to load study");
    } finally {
      setLoading(false);
    }
  };

const fetchStudents = async () => {
 try {
      const params = new URLSearchParams({
        pageNum: studPageNum.toString(),
        pageSize: studPageSize.toString(),
        sortBy: studSortBy,
        sortDirection: studSortDirection.toString()
      });

      if (appliedStudName.trim() !== "") {
        params.append("studentName", appliedStudName.trim());
      }
      if (appliedPartnerName.trim() !== "") {
        params.append("partnerName", appliedPartnerName.trim());
      }

      const res = await fetch(`${API_URL}/studystudent/getstudystudents/${id}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed loading study relation assigned students matrix.", err);
    }
};

const updateStudy = async () => {

    setError("");
    console.log(form.startDate); 
    const response = await fetch(
      `${API_URL}/study/editstudy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ID: form.id,
          StudyName: form.studyName,
          Description: form.description,
          StartDate: form.startDate,
          EndDate: form.endDate
        })
      }
    );     if (!response.ok) {
      setError("Failed to update study");
      return;
    }

    navigate("/studies/all");
};

   const fetchStudyResearchers = async () => {
     try {
      const params = new URLSearchParams({
        pageNum: resPageNum.toString(),
        pageSize: resPageSize.toString(),
        sortBy: resSortBy,
        sortDirection: resSortDirection.toString()
      });

      if (appliedResName.trim() !== "") {
        params.append("researcherName", appliedResName.trim());
      }

      const res = await fetch(`${API_URL}/studyresearcher/getstudyresearchers/${id}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setStudyResearchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed loading study relation researchers data matrix.", err);
    }
};

const addResearcherToStudy = async () => {
  if (!selectedResearcherId) return;

  await fetch(`${API_URL}/studyresearcher/addstudyresearcher`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      StudyID: Number(id),
      ResearcherID: Number(selectedResearcherId)
    })
  });

  setSelectedResearcherId("");
  setResPageNum(1);
  fetchStudyResearchers();
  fetchResearchers();
};


const removeResearcher = async (studyReseracherId) => {
  const confirmed = window.confirm(
    "Are you sure you want to remove this researcher?"
  );

  if (!confirmed) return;

  await fetch(`${API_URL}/studyresearcher/deletestudyresearcher/${studyReseracherId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

if (studyResearchers.length === 1 && resPageNum > 1) {
      setResPageNum(prev => prev - 1);
    } else {
      fetchStudyResearchers();
    }

};

const addStudentToStudy = async () => {
  if (!selectedStudentId) return;

  await fetch(`${API_URL}/studystudent/addstudystudent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      StudentID: Number(selectedStudentId),
      StudyID: Number(id)
    })
  });

  setSelectedStudentId("");
  setShowAddStudentModal(false);
  setStudPageNum(1);
  fetchStudents();
};

const confirmDeleteStudent = async () => {
  if (!studentToDelete) return;

  await fetch(
    `${API_URL}/studystudent/deletestudystudent/${studentToDelete}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  setStudentToDelete(null);
  setShowConfirmDeleteModal(false);
  if (students.length === 1 && studPageNum > 1) {
      setStudPageNum(prev => prev - 1);
    } else {
      fetchStudents();
    }
};

  const handleResFilterSubmit = (e) => {
    e.preventDefault();
    setResPageNum(1);
    setAppliedResName(searchResName);
  };

  const handleStudFilterSubmit = (e) => {
    e.preventDefault();
    setStudPageNum(1);
    setAppliedStudName(searchStudName);
    setAppliedPartnerName(searchPartnerName);
  };


  if (loading) return <p>Loading...</p>;

    return (
    <div>
      <div className="page-header">
      <button
        className="page-back"
        onClick={() => navigate("/studies/all")}
      >
        ← Back
      </button>


    </div>
    <div className="mixed-page">

  {/* ===== Header ===== */}
  <div className="page-header">
    <h2 className="page-title">
      Edit Study {form.studyName}
    </h2>
  </div>

  {/* ===== Study Form ===== */}
  <div className="section-card">

    {error && <p className="form-error">{error}</p>}

    <div className="form-group">
      <label>Name</label>
      <input
        type="text"
        value={form.studyName}
        onChange={(e) =>
          setForm({ ...form, studyName: e.target.value })
        }
        maxLength={250}
      />
    </div>

    <div className="form-group">
      <label>Start Date</label>
      <input
        type="date"
        value={form.startDate}
        onChange={(e) =>
          setForm({ ...form, startDate: e.target.value })
        }
      />
    </div>

    <div className="form-group">
      <label>End Date</label>
      <input
        type="date"
        value={form.endDate}
        onChange={(e) =>
          setForm({ ...form, endDate: e.target.value })
        }
      />
    </div>

    <div className="form-group">
      <label>Description</label>
      <textarea
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        maxLength={250}
      />
    </div>

    <div className="form-actions">
      <button onClick={updateStudy}>Save</button>
      <button onClick={() => navigate("/studies/all")}>
        Cancel
      </button>
    </div>

  </div>

  {/* ===== Relationship Panels ===== */}
  <div className="relationship-grid">

    {/* ===== Researchers ===== */}
    <div className="section-card">
      <h3 className="section-header">Study Researchers</h3>

      <div className="inline-add">
        <select
          value={selectedResearcherId}
          onChange={(e) =>
            setSelectedResearcherId(e.target.value)
          }
        >
          <option value="">-- Add researcher --</option>
          {researchers.map((researcher) => (
            <option key={researcher.id} value={researcher.id}>
              {researcher.name}
            </option>
          ))}
        </select>

        <button
          className="primary-button"
          onClick={addResearcherToStudy}
          disabled={!selectedResearcherId}
        >
          Add Researcher
        </button>
      </div>

<div className="filter-panel">
      <form onSubmit={handleResFilterSubmit} class="filters-form">
              <input 
                type="text" 
                placeholder="Search researcher..." 
                value={searchResName} 
                onChange={(e) => setSearchResName(e.target.value)}
                className="filters-input"              />
              <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
            </form>

            <div class="filters-form">
              <label style={{marginRight: "5px" }} >Sort By:</label>
              <select value={resSortBy} onChange={(e) => setResSortBy(e.target.value)} className="filters-select">
                <option value="lName">Name (Last Name)</option>
                <option value="dtCreated">Date Assigned</option>
              </select>
               <label style={{marginRight: "5px" }} >Direction:</label>
      
              <select value={resSortDirection} onChange={(e) => setResSortDirection(Number(e.target.value))} className="filters-select">
                <option value={0}>Ascending</option>
                <option value={1}>Descending</option>
              </select>
            </div>

</div>
      

      <table className="data-table">
        <thead>
          <tr>
            <th>Researcher</th>
            <th>Remove</th>
          </tr>
        </thead>

        <tbody>
          {studyResearchers.length === 0 ? (
            <tr>
              <td colSpan="2" className="table-empty">
                No researchers assigned
              </td>
            </tr>
          ) : (
            studyResearchers.map((er) => (
              <tr key={er.id}>
                <td>{er.researcherName}</td>
                <td>
                  <button
                    className="action-button danger"
                    onClick={() => removeResearcher(er.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

            <div className="paging-form">
              <button disabled={resPageNum === 1} onClick={() => setResPageNum(p => Math.max(p - 1, 1))} style={{ padding: "3px 7px" }}
        >
          &larr; Prev</button>
              <span>Page {resPageNum}</span>
              <button disabled={studyResearchers.length < resPageSize} onClick={() => setResPageNum(p => p + 1)} style={{ padding: "3px 7px" }}>Next &rarr;</button>
            </div>

    </div>

    {/* ===== Students ===== */}
    <div className="section-card">
      <h3 className="section-header">Students</h3>

      <button
        className="primary-button"
        onClick={() => setShowAddStudentModal(true)}
      >
        Add Student
      </button>

<div className="filter-panel">
  <form onSubmit={handleStudFilterSubmit} class="filters-form">
              <div style={{ display: "flex", gap: "6px" }}>
                <input 
                  type="text" 
                  placeholder="Student name..." 
                  value={searchStudName} 
                  onChange={(e) => setSearchStudName(e.target.value)}
                  className="filters-input"
                />
                <input 
                  type="text" 
                  placeholder="Organisation..." 
                  value={searchPartnerName} 
                  onChange={(e) => setSearchPartnerName(e.target.value)}
                  className="filters-input"
                />
              </div>
              <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
            </form>

            <div class="filters-form">
              <label style={{marginRight: "5px" }}>Sort By:</label>
              <select value={studSortBy} onChange={(e) => setStudSortBy(e.target.value)} className="filters-select">
                <option value="lName">Student Last Name</option>
                <option value="partnerName">Organisation Name</option>
              </select>
               <label style={{marginRight: "5px" }}>Direction:</label>
              <select value={studSortDirection} onChange={(e) => setStudSortDirection(Number(e.target.value))} className="filters-select">
                <option value={0}>Ascending</option>
                <option value={1}>Descending</option>
              </select>
            </div>
</div>
          


      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Organisation</th>
            <th>Remove</th>
          </tr>
        </thead>

        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="3" className="table-empty">
                No students assigned
              </td>
            </tr>
          ) : (
            students.map((s) => (
              <tr key={s.id}>
                <td>{s.fullName}</td>
                <td>{s.partnerName}</td>
                <td>
                  <button
                    className="action-button danger"
                    onClick={() => {
                      setStudentToDelete(s.id);
                      setShowConfirmDeleteModal(true);
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
             <div className="paging-form">
              <button disabled={studPageNum === 1} onClick={() => setStudPageNum(p => Math.max(p - 1, 1))} style={{ padding: "3px 7px" }}
        >
          &larr; Prev</button>
              <span>Page {studPageNum}</span>
              <button disabled={students.length < studPageSize} onClick={() => setStudPageNum(p => p + 1)} style={{ padding: "3px 7px" }}
        >
          Next &rarr;</button>
            </div>
     
    </div>

  </div>

  {/* ===== Remove Student Modal ===== */}
  {showConfirmDeleteModal && (
    <div className="modal">
      <h4>Sure?</h4>
      <p>Are you sure you want to remove this student?</p>

      <button onClick={confirmDeleteStudent}>
        Yes, remove
      </button>
      <button
        onClick={() => {
          setShowConfirmDeleteModal(false);
          setStudentToDelete(null);
        }}
      >
        Cancel
      </button>
    </div>
  )}

  {/* ===== Add Student Modal ===== */}
  {showAddStudentModal && (
    <div className="modal">
      <h4>Add Student</h4>

      <select
        value={selectedStudentId}
        onChange={(e) =>
          setSelectedStudentId(e.target.value)
        }
        className="filters-select"
      >
        <option value="">-- Select student --</option>
        {availableStudents.map((s) => (
          <option key={s.id} value={s.id}>
            {s.fullName} (ID: {s.id})
          </option>
        ))}
      </select>

      <button
        onClick={addStudentToStudy}
        disabled={!selectedStudentId}
      >
        Add
      </button>
      <button onClick={() => setShowAddStudentModal(false)}>
        Cancel
      </button>
    </div>
  )}

</div>

</div>
);



}

export default EditStudy; 