import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";


const API_URL = "http://localhost:5204/api";

function AddLoan(){
    const navigate = useNavigate();
    const { user } = useAuth();
    const roleId = Number(user.roleId);
    const ADMIN_ROLE_ID = 100001;   
    const isAdmin = roleId === ADMIN_ROLE_ID;
    
    const token = localStorage.getItem("token");
    const [partners, setPartners] = useState([]);

    const [form, setForm] = useState({
    partnerID: "",
    loanType: "",
    startDate: "",
    endDate: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
    fetchPartners();
  }, []);

    const fetchPartners = async () => {
    try {
      const paginationParams = "pageNum=1&pageSize=100&sortBy=partnerName&sortDirection=0";
      const response = await fetch(`${API_URL}/partner/getpartners?${paginationParams}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				});
      const data = await response.json();
      setPartners(data);
      console.log(data);
    } catch {
      setError("Failed to load partner types");
    } finally {
      setLoading(false);
    }
  };

const submitLoan = async () => {
    setError("");

 const response = await fetch(`${API_URL}/loan/addloan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`  },
      body: JSON.stringify({
        PartnerID: Number(form.partnerID),
        LoanType: form.loanType,
        StartDate: form.startDate,
        EndDate: form.endDate
      })
    });

    if (!response.ok) {
      setError("Failed to add loan");
      return;
    }
    navigate("/loans/all");
  };

  
if (!isAdmin) {
    return <p className="form-error">Access denied</p>;
  }
  if (isAdmin && loading) return <p className="loading-text">Loading...</p>;

  return(
    <div>
              <div className="page-header">
      <button
        className="page-back"
        onClick={() => navigate("/loans/all")}
      >
        ← Back
      </button>


    </div>

      <div className="form-page">
    <h2 className="form-title">Add New Loan</h2>

    {error && <p className="form-error">{error}</p>}

    <div className="form-group">
      <label>Partner</label>
      <select
        value={form.partnerID}
        onChange={(e) =>
          setForm({ ...form, partnerID: e.target.value })
        }
      >
        <option value="">-- Select partner --</option>
        {partners.map((partner) => (
          <option key={partner.id} value={partner.id}>
            {partner.partnerName}
          </option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>Loan Type</label>
      <select
        value={form.loanType}
        onChange={(e) =>
          setForm({ ...form, loanType: e.target.value })
        }
      >
        <option value="">-- Select loan type --</option>
        <option value="O">Outgoing</option>
        <option value="I">Incoming</option>
      </select>
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
      <button onClick={submitLoan}>Add Loan</button>
      <button onClick={() => navigate("/loans/all")}>
        Cancel
      </button>
    </div>
  </div>
    </div>
  ); 


}

export default AddLoan; 