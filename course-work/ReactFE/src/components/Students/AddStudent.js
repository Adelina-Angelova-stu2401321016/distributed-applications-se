import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api";

function AddStudent(){
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [partners, setPartners] = useState([]);

    const [form, setForm] = useState({
    fName: "",
    lName: "",
    partnerId: ""
    });

    const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
      useEffect(() => {
      fetchPartners();
    }, []);
  
    const fetchPartners = async () => {
      try {
        const params = new URLSearchParams({
      pageNum: "1",
      pageSize: "100", 
      sortBy: "partnerName",
      sortDirection: "0"
    });
        const response = await fetch(`${API_URL}/partner/getpartners?${params.toString()}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				});

        const data = await response.json();
        setPartners(data);
      } catch {
        setError("Failed to load partners");
      } finally {
        setLoading(false);
      }
    };
    const submitStudent = async () => {
    setError("");

    const response = await fetch(`${API_URL}/student/addstudent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        FName: form.fName,
        LName: form.lName,
        PartnerId: Number(form.partnerId)   
      })
    });

    if (!response.ok) {
      setError("Failed to add student");
      return;
    }
    navigate("/students/all");
  };

    if (loading) return <p>Loading...</p>;

  return(
    <div>
      <div className="page-header">
      <button
        className="page-back"
        onClick={() => navigate("/students/all")}
      >
        ← Back
      </button>


    </div>
<div className="form-page">
          

  <h2 className="form-title">Add New Student</h2>

  {error && <p className="form-error">{error}</p>}

  <div className="form-group">
    <label>First Name</label>
    <input
      type="text"
      value={form.fName}
      onChange={(e) =>
        setForm({ ...form, fName: e.target.value })
      }
      maxLength={100}
    />
  </div>

  <div className="form-group">
    <label>Last Name</label>
    <input
      type="text"
      value={form.lName}
      onChange={(e) =>
        setForm({ ...form, lName: e.target.value })
      }
      maxLength={100}
    />
  </div>

  <div className="form-group">
    <label>Organisation</label>
    <select
      value={form.partnerId}
      onChange={(e) =>
        setForm({ ...form, partnerId: e.target.value })
      }
    >
      <option value="">-- Select organisation --</option>
      {partners.map((partner) => (
        <option key={partner.id} value={partner.id}>
          {partner.partnerName}
        </option>
      ))}
    </select>
  </div>

  <div className="form-actions">
    <button onClick={submitStudent}>Add Student</button>
    <button onClick={() => navigate("/students/all")}>
      Cancel
    </button>
  </div>

</div>

    </div>
  ); 


}

export default AddStudent; 
