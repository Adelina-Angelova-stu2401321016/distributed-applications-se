import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5204/api/partner";

function EditPartner(){

  const { id } = useParams();
  const navigate = useNavigate();

   const token = localStorage.getItem("token");
   const [partnerTypes, setpartnerTypes] = useState([]);
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    
    const [form, setForm] = useState({
    partnerName: "",
    vat: "",
    typeId: ""
  });

    useEffect(() => {
    loadData();
  }, []);

    const loadData = async () => {
    try {
      const typeParams = "pageNum=1&pageSize=100&sortBy=typeName&sortDirection=0";
      const [partnerRes, partnerTypesRes] = await Promise.all([
        fetch(`${API_URL}/getpartner/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				}),
        fetch(`${API_URL}/getpartnertypes?${typeParams}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				})
      ]);

      if (!partnerRes.ok) throw new Error("Failed to load partner");
      if (!partnerTypesRes.ok) throw new Error("Failed to load partner types");
     

      const partner = await partnerRes.json();
      const partnerTypesData = await partnerTypesRes.json();
      

      setpartnerTypes(partnerTypesData);
     
    

      setForm({
        id: partner.id,
        partnerName: partner.partnerName,
        vat: partner.vat,
        typeId: partner.typeID
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
      `${API_URL}/editpartner`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ID: Number(form.id),
          PartnerName: form.partnerName,
          VAT: form.vat,
          TypeID: Number(form.typeId)
        })
      }
    );

    if (!response.ok) {
      setError("Failed to update partner");
      return;
    }

    navigate("/partners/all");
  };

  if (loading) return <p className="loading-text">Loading...</p>;


  return(
    <div>
        <div className="page-header">
        <button className="page-back" style={{textAlign: "left"}} onClick={() => navigate("/partners/all")}>
          ← Back
        </button>
      </div>
      <div  className="form-page">
    <h2 className="form-title">Edit Partner</h2>

  {error && <p className="form-error">{error}</p>}

  <div className="form-group">
    <label>Partner Name</label>
    <input
      type="text"
      value={form.partnerName}
      onChange={(e) =>
        setForm({ ...form, partnerName: e.target.value })
      }
      maxLength={255}
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
      <option value="">-Types-</option>
      {partnerTypes.map((partnerType) => (
        <option key={partnerType.id} value={partnerType.id}>
          {partnerType.typeName}
        </option>
      ))}
    </select>
  </div>

  <div className="form-actions">
    <button onClick={submitUpdate}>Save</button>
    <button onClick={() => navigate("/partners/all")}>Cancel</button>
  </div>

      </div>

        </div>
    );

}

export default EditPartner; 

