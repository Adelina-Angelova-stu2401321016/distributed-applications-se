import { useEffect, useState } from "react";
import { useNavigate,useParams } from "react-router-dom";

const API_URL = "http://localhost:5204/api";

function EditFund(){
  const { id } = useParams();
  const navigate = useNavigate();

   const token = localStorage.getItem("token");
  const [partners, setPartners] = useState([]);
  const [studies, setStudies] = useState([]);
const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [form, setForm] = useState({
    id: "",
    partnerId: "",
    amount: "",
    currency: "",
    reason: "",
    studyId: ""
});

useEffect(() => {
    loadData();
}, []);

   const loadData = async () => {
    try {
      setLoading(true);
    setError("");

      const [fundRes, partnersRes, studiesRes] = await Promise.all([
      fetch(`${API_URL}/fund/getfund/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
      fetch(`${API_URL}/partner/getpartners?pageNum=1&pageSize=100&sortBy=partnerName&sortDirection=0`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
      fetch(`${API_URL}/study/getstudies?pageNum=1&pageSize=100&sortBy=studyName&sortDirection=0`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
    ]);

      if (!fundRes.ok) throw new Error("Failed to load fund");
      if (!partnersRes.ok) throw new Error("Failed to load partners");
      if (!studiesRes.ok) throw new Error("Failed to load studies");
     
      const fund = await fundRes.json();
      console.log(fund);

      const partnersData = await partnersRes.json();
      const studiesData = await studiesRes.json();
      

      setPartners(partnersData);
     setStudies(studiesData);

      setForm({
        id: fund.id,
        partnerId: fund.partnerID,
    amount: fund.amount,
    currency: fund.currency,
    reason: fund.reason,
    studyId: fund.studyID
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
      `${API_URL}/fund/editfund`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ID: Number(form.id),
          PartnerID: Number(form.partnerId),
          Amount: form.amount,
        Currency: form.currency,
    Reason: form.reason,
    StudyId: Number(form.studyId)
        })
      }
    );

    if (!response.ok) {
      setError("Failed to update fund");
      return;
    }

    navigate("/funds/all");
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

  <h2 className="form-title">Edit Fund</h2>

  {error && <p className="form-error">{error}</p>}

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
    <button onClick={submitUpdate}>Save</button>
    <button onClick={() => navigate("/funds/all")}>
      Cancel
    </button>
  </div>

</div>

</div>
  );


}

export default EditFund; 