import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api";

function AddFund(){
 const navigate = useNavigate();

   const token = localStorage.getItem("token");
  const [partners, setPartners] = useState([]);
  const [studies, setStudies] = useState([]);
const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [form, setForm] = useState({
    partnerId: "",
    amount: "",
    currency: "",
    reason: "",
    studyId: ""
});

useEffect(() => {
    const loadDependencies = async () => {
      setLoading(true);
      setError("");
      await Promise.all([fetchPartners(), fetchStudies()]);
      setLoading(false);
    };

  loadDependencies();
  }, []);  
  
  const fetchPartners = async () => {
      try {
      const response = await fetch(`${API_URL}/partner/getpartners?pageNum=1&pageSize=100`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Could not retrieve organizational data.");
      }

      const data = await response.json();
      setPartners(data);
    } catch (err) {
      setError("Failed to load corporate partner selections.");
    }
  };

  const fetchStudies = async () => {
     try {
      const response = await fetch(`${API_URL}/study/getstudies?pageNum=1&pageSize=100`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Could not retrieve research studies.");
      }

      const data = await response.json();
      setStudies(data);
    } catch (err) {
      setError("Failed to load tracking studies.");
    }
  };


        const submitFund = async () => {
    setError("");

    if (!form.partnerId || !form.studyId || !form.amount || !form.currency || !form.reason) {
      setError("Please fill out all input parameters before submitting.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/fund/addfund`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          PartnerID: Number(form.partnerId),
          Amount: parseFloat(form.amount),
          Currency: form.currency.trim(),
          Reason: form.reason.trim(),
          StudyID: Number(form.studyId) 
        })
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        setError(errorMsg || "Failed to finalize funding request entry.");
        return;
      }

      navigate("/funds/all");
    } catch (err) {
      setError("Network fault dropped your server synchronization process.");
    }
  };

     if (loading) return <p>Loading...</p>;

  return(
    <div>
      
      <div className="page-header">
      <button
        className="page-back"
        onClick={() => navigate("/funds/all")}
      >
        ← Back
      </button>


    </div>
<div className="form-page">

  <h2 className="form-title">Make Funding Request</h2>

      {error && <p className="form-error" style={{ color: "red", fontWeight: "bold" }}>{error}</p>}


  <div className="form-group">
    <label>To Organisation</label>
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

  <div className="form-group">
    <label>Amount</label>
    <input
      type="number"
      step="0.01"
      value={form.amount}
      onChange={(e) =>
        setForm({ ...form, amount: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Currency</label>
    <input
      type="text"
      value={form.currency}
      onChange={(e) =>
        setForm({ ...form, currency: e.target.value })
      }
      maxLength={4}
    />
  </div>

  <div className="form-group">
    <label>Reason</label>
    <input
      type="text"
      value={form.reason}
      onChange={(e) =>
        setForm({ ...form, reason: e.target.value })
      }
      maxLength={250}
    />
  </div>

  <div className="form-group">
    <label>Study Receiver</label>
    <select
      value={form.studyId}
      onChange={(e) =>
        setForm({ ...form, studyId: e.target.value })
      }
    >
      <option value="">-Studies-</option>
      {studies.map((study) => (
        <option key={study.id} value={study.id}>
          {study.studyName}
        </option>
      ))}
    </select>
  </div>

  <div className="form-actions">
    <button onClick={submitFund}>Add Fund</button>
    <button onClick={() => navigate("/funds/all")}>
      Cancel
    </button>
  </div>

</div>

    </div>
  ); 

}

export default AddFund; 