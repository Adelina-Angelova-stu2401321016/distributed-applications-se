import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api";


function AddStudy(){
  const navigate = useNavigate();
    const token = localStorage.getItem("token");
    
    const [form, setForm] = useState({
    studyName: "",
    description: "",
    startDate: "",
    endDate: ""
    });

    const [error, setError] = useState("");


const submitStudy = async () => {
    setError("");

 const response = await fetch(`${API_URL}/study/addstudy`, {
      method: "POST",
      headers: { "Content-Type": "application/json", 
         Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        StudyName: form.studyName,
        Description: form.description,
        StartDate: form.startDate,
        EndDate: form.endDate
      })
    });

    if (!response.ok) {
      setError("Failed to add study");
      return;
    }
    navigate("/studies/all");
  };

  
  return(
    <div>
          <div className="page-header">
      <button
        className="page-back"
        onClick={() => navigate("/studies/all")}
      >
        ← Back
      </button>


    </div>
<div className="form-page">

  <h2 className="form-title">Add New Study</h2>

  {error && <p className="form-error">{error}</p>}

  <div className="form-group">
    <label>Study Name</label>
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
    <label>Description</label>
    <input
      type="text"
      value={form.description}
      onChange={(e) =>
        setForm({ ...form, description: e.target.value })
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

  <div className="form-actions">
    <button onClick={submitStudy}>Add Study</button>
    <button onClick={() => navigate("/studies/all")}>
      Cancel
    </button>
  </div>

</div>
    </div>
  ); 


}

export default AddStudy; 