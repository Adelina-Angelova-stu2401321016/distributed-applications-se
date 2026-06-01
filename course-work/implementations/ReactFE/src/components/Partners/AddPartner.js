
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/partner";

function AddPartner(){
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [partnerTypes, setpartnerTypes] = useState([]);

    const [form, setForm] = useState({
    partnerName: "",
    vat: "",
    typeId: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
    fetchPartnerTypes();
  }, []);

    const fetchPartnerTypes = async () => {
   try {
    // Provide explicit pagination parameters to prevent a backend 400 validation error
    const params = new URLSearchParams({
      pageNum: "1",
      pageSize: "100",
      sortBy: "typeName",
      sortDirection: "0"
    });

    const response = await fetch(`${API_URL}/getpartnertypes?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Server status validation failed: ${response.status}`);
    }

    const data = await response.json();
    setpartnerTypes(data);
  } catch (err) {
    console.error(err);
    setError("Failed to load partner types");
    setpartnerTypes([]);
  } finally {
    setLoading(false);
  }
  };

    const submitPartner = async () => {
    setError("");

    const response = await fetch(`${API_URL}/addpartner`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        PartnerName: form.partnerName,
        VAT: form.vat,
        TypeId: Number(form.typeId)
      })
    });

    if (!response.ok) {
      setError("Failed to add partner");
      return;
    }
    navigate("/partners/all");
  };

if (loading) return <p className="loading-text">Loading...</p>;

return (
  <div>
      <div className="page-header">
        <button className="page-back" style={{textAlign: "left"}} onClick={() => navigate("/partners/all")}>
          ← Back
        </button>


      </div>
      <div  className="form-page">
          <h2 className="form-title">Add New Partner</h2>

    {error && <p className="form-error">{error}</p>}

    <div className="form-group">
      <label>Partner Name</label>
      <input
        type="text"
        value={form.partnerName}
        onChange={(e) =>
          setForm({ ...form, partnerName: e.target.value })
        }
        maxLength={250}
      />
    </div>

    <div className="form-group">
      <label>VAT</label>
      <input
        type="text"
        value={form.vat}
        onChange={(e) =>
          setForm({ ...form, vat: e.target.value })
        }
        maxLength={80}
      />
    </div>

    <div className="form-group">
      <label>Partner Type</label>
      <select
        value={form.typeId}
        onChange={(e) =>
          setForm({ ...form, typeId: e.target.value })
        }
      >
        <option value="">-- Select partner type --</option>
        {partnerTypes.map((partnerType) => (
          <option key={partnerType.id} value={partnerType.id}>
            {partnerType.typeName}
          </option>
        ))}
      </select>
    </div>

    <div className="form-actions">
      <button onClick={submitPartner}>Add Partner</button>
      <button onClick={() => navigate("/partners/all")}>Cancel</button>
    </div>
      </div>
  
  </div>
);


}

export default AddPartner; 