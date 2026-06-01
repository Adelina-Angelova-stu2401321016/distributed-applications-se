import { useEffect, useState } from "react";
import { useNavigate,useParams } from "react-router-dom";

const API_URL = "http://localhost:5204/api";

function EditStudent(){
  const { id } = useParams();
  const navigate = useNavigate();

   const token = localStorage.getItem("token");
 const [partners, setPartners] = useState([]);
const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [form, setForm] = useState({
    id: "",
    fName: "",
    lName: "",
    partnerId: ""
});

useEffect(() => {
    loadData();
}, []);

   const loadData = async () => {
    try {
setLoading(true);
      setError("");
const partnerParams = new URLSearchParams({
        pageNum: "1",
        pageSize: "100", 
        sortBy: "partnerName",
        sortDirection: "0"
});
      const [studentRes, partnersRes] = await Promise.all([
        fetch(`${API_URL}/student/getstudent/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				}),
        fetch(`${API_URL}/partner/getpartners?${partnerParams.toString()}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				})
      ]);

      if (!studentRes.ok) throw new Error("Failed to load student");
      if (!partnersRes.ok) throw new Error("Failed to load partners");
     

      const student = await studentRes.json();
      const partnersData = await partnersRes.json();
      

      setPartners(partnersData);
     

      setForm({
        id: student.id,
        fName: student.fName,
        lName: student.lName, 
        partnerId: student.partnerID
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    const submitUpdate = async () => {
    setError("");

    const response = await fetch(
      `${API_URL}/student/editstudent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ID: Number(form.id),
          FName: form.fName,
          LName: form.lName,
          PartnerID: Number(form.partnerId)
        })
      }
    );

    if (!response.ok) {
      setError("Failed to update student");
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

  <h2 className="form-title">Edit Student</h2>

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
      <option value="">-Organisations-</option>
      {partners.map((partner) => (
        <option key={partner.id} value={partner.id}>
          {partner.partnerName}
        </option>
      ))}
    </select>
  </div>

  <div className="form-actions">
    <button onClick={submitUpdate}>Save</button>
    <button onClick={() => navigate("/students/all")}>
      Cancel
    </button>
  </div>

</div>

</div>
  );


}

export default EditStudent; 
