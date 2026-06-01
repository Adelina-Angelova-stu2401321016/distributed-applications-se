import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5204/api/room";

function EditRoom(){
  const navigate = useNavigate();
  const { id } = useParams(); // exhibit id from route
  
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    
      const [form, setForm] = useState({
        roomName: "",
        temperature: "",
        humidity: "",
        lightExp: ""
    });
    
    useEffect(() => {
    fetchRoom();
  }, [id]);

 const fetchRoom = async () => {
    try {
      const response = await fetch(
        `${API_URL}/getroom/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        setError("Failed to load room");
        return;
      }

      const data = await response.json();
      console.log(data);
      setForm({
        id: data.id,
        roomName: data.roomName,
        temperature: data.temperature,
        humidity: data.humidity,
        lightExp: data.light_Exp
      });
    } catch {
      setError("Failed to load room");
    } finally {
      setLoading(false);
    }
  };

 const updateRoom = async () => {

    setError("");

    const response = await fetch(
      `${API_URL}/editroom`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ID: form.id,
          Room_Name: form.roomName,
          Temperature: form.temperature,
          Humidity: form.humidity,
          Light_Exp: form.lightExp
        })
      }
    );

    if (!response.ok) {
      setError("Failed to update room");
      return;
    }

    navigate("/rooms/all");
  };
  
  if (loading) return <p className="loading-text">Loading...</p>;

return (
  <div>
        <div className="page-header">
      <button
        className="page-back"
        onClick={() => navigate("/rooms/all")}
      >
        ← Back
      </button>


    </div>

 
   
<div className="form-page">
     <h2 className="form-title">Edit Room {form.roomName}</h2>
 {error && <p className="form-error">{error}</p>}
  <div className="form-group">
      <label>Name</label>
      <input
        type="text"
        value={form.roomName}
        onChange={(e) =>
          setForm({ ...form, roomName: e.target.value })
        }
        maxLength={100}
      />
    </div>

    <div className="form-group">
      <label>Temperature</label>
      <input
        type="text"
        value={form.temperature}
        onChange={(e) =>
          setForm({ ...form, temperature: e.target.value })
        }
        maxLength={50}
      />
    </div>

    <div className="form-group">
      <label>Humidity</label>
      <input
        type="text"
        value={form.humidity}
        onChange={(e) =>
          setForm({ ...form, humidity: e.target.value })
        }
        maxLength={50}
      />
    </div>

    <div className="form-group">
      <label>Light Exposure</label>
      <input
        type="text"
        value={form.lightExp}
        onChange={(e) =>
          setForm({ ...form, lightExp: e.target.value })
        }
        maxLength={50}
      />
    </div>

    <div className="form-actions">
      <button onClick={updateRoom}>Save Changes</button>
      <button onClick={() => navigate("/rooms/all")}>
        Cancel
      </button>
    </div>
  
</div>
  </div>
);

}

export default EditRoom; 