import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const EXHIBITS_API = "http://localhost:5204/api/exhibit";
const USERS_API = "http://localhost:5204/api/users";


function AddExhibit(){
  const navigate = useNavigate();
  const { user } = useAuth();

  const token = localStorage.getItem("token");
  const roleId = Number(user?.roleId);
  const userId = Number(user?.userId); 

  const [curators, setCurators] = useState([]);
  const [loading, setLoading] = useState(roleId === 100001);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    description: "",
    entryPrice: "",
    curatorId: ""
  });

  useEffect(() => {
    if (roleId === 100002) {
      setForm((prev) => ({
        ...prev,
        curatorId: user.userId
      }));
      console.log(user.userId); 
    }
  }, [roleId]);

  useEffect(() => {
    if (roleId === 100001) {
      fetchCurators();
    }
  }, [roleId]);

  const handleServerError = async (response, fallbackMessage) => {
    try {
      const errorData = await response.json();
      setError(errorData.message || fallbackMessage);
    } catch {
      setError(fallbackMessage);
    }
  };

  const fetchCurators = async () => {
    try {
      const response = await fetch(`${USERS_API}/getcurators`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        await handleServerError(response, "Failed to load curators list.");
        return;
      }
      const data = await response.json();
      setCurators(data);
    } catch {
      setError("Network error");
      
    } finally {
      setLoading(false);
    }
  };

  const submitExhibit = async () => {
    setError("");

    const curatorIdToSend =
      roleId === 100001
        ? Number(form.curatorId)
        : Number(user?.userId); // curator creates for themselves

    if (!curatorIdToSend) {
      setError("Curator is required" + curatorIdToSend);
      return;
    }
   try{
    const response = await fetch(`${EXHIBITS_API}/addexhibit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        Title: form.title,
        Start_Date: form.startDate,
        End_Date: form.endDate,
        Description: form.description,
        Entry_Price: Number(form.entryPrice),
        CuratorID: curatorIdToSend
      })
    });

    if (!response.ok) {
        await handleServerError(response, "Failed to create exhibit record.");
        return;
      }

    navigate("/exhibits/all");
  } catch (err) {
      setError("Network error: Could not save the exhibit to the server.");
    }
  };

if (loading) return <p className="loading-text">Loading...</p>;

return (
  <div>

    
    <div className="page-header">
      <button
        className="page-back"
        onClick={() => navigate("/exhibits/all")}
      >
        ← Back
      </button>

      
    </div>
    <div  className="mixed-page">
<h2 className="page-title">Add New Exhibit</h2>
    <div className="section-card">

          {error && (
            <div className="form-error" style={{ background: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>
              <strong>Error:</strong> {error}
            </div>
          )}

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          maxLength={100}
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
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label>Entry Price</label>
        <input
          type="number"
          step="0.01"
          value={form.entryPrice}
          onChange={(e) =>
            setForm({ ...form, entryPrice: e.target.value })
          }
        />
      </div>

      {/* ADMIN ONLY */}
      {roleId === 100001 && (
        <div className="form-group">
          <label>Curator</label>
          <select
            value={form.curatorId}
            onChange={(e) =>
              setForm({ ...form, curatorId: e.target.value })
            }
          >
            <option value="">-- Select curator --</option>
            {curators.map((curator) => (
              <option key={curator.id} value={curator.id}>
                {curator.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CURATOR INFO */}
      {roleId === 100002 && (
        <p>
          Curator: <strong>{user.fName} {user.userId}</strong>
        </p>
      )}

      <div className="form-actions">
        <button onClick={submitExhibit}>Add Exhibit</button>
        <button onClick={() => navigate("/exhibits/all")}>
          Cancel
        </button>
      </div>

    </div>

    </div>
  </div>
);

}

export default AddExhibit; 