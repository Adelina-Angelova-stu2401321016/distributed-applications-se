import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/room";

function AddRoom(){

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
  /*  const [loading, setLoading] = useState(true);*/

    const [error, setError] = useState("");
    
      const [form, setForm] = useState({
        roomName: "",
        temperature: "",
        humidity: "",
        lightExp: ""
    });
    
    const submitRoom = async () => {
    setError("");

    const response = await fetch(`${API_URL}/addroom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        Room_Name: form.roomName,
        Temperature: form.temperature,
        Humidity: form.humidity,
        Light_Exp: form.lightExp
      })
    });

    if (!response.ok) {
      setError("Failed to add room");
      return;
    }

    navigate("/rooms/all");
  };

   /* if (loading) return <p>Loading...</p>;*/
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
 <h2 className="form-title">Add New Room</h2>

    {error && <p className="form-error">{error}</p>}

   <div className="form-group">
      <label>Room Name</label>
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
      <label>Temperature (C)</label>
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
      <label>Humidity (%)</label>
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
      <label>Light Exposure (%) </label>
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
      <button onClick={submitRoom}>Add Room</button>
      <button onClick={() => navigate("/rooms/all")}>
        Cancel
      </button>
    </div>
 
</div>
  </div>
);

}

export default AddRoom; 