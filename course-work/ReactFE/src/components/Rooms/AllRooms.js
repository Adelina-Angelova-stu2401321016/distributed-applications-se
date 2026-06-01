import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5204/api/room";

function AllRooms(){

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [searchName, setSearchName] = useState("");
  const [searchTemp, setSearchTemp] = useState("");
  const [searchHumidity, setSearchHumidity] = useState("");
  const [searchLight, setSearchLight] = useState("");

  const [appliedName, setAppliedName] = useState("");
  const [appliedTemp, setAppliedTemp] = useState("");
  const [appliedHumidity, setAppliedHumidity] = useState("");
  const [appliedLight, setAppliedLight] = useState("");

   const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState("roomName");
  const [sortDirection, setSortDirection] = useState(0); 

useEffect(() => {
    fetchRooms();
  }, [pageNum, sortBy, sortDirection, appliedName, appliedTemp, appliedHumidity, appliedLight]);

    const fetchRooms = async () => {
      try{
        setLoading(true);
      setError("");

      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortDirection: sortDirection.toString()
      });
      if (appliedName.trim() !== "") {
        params.append("roomName", appliedName.trim());
      }
      if (appliedTemp.trim() !== "") {
        params.append("temperature", appliedTemp.trim());
      }
      if (appliedHumidity.trim() !== "") {
        params.append("humidity", appliedHumidity.trim());
      }
      if (appliedLight.trim() !== "") {
        params.append("ligth_exp", appliedLight.trim());
      }

      const response = await fetch(`${API_URL}/getrooms?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned diagnostic validation code: ${response.status}`);
      }

      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch room telemetry datasets cleanly.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPageNum(1); 
    setAppliedName(searchName);
    setAppliedTemp(searchTemp);
    setAppliedHumidity(searchHumidity);
    setAppliedLight(searchLight);
  };

    const deleteRoom = async () => {
      try{
        const response =    await fetch(
      `${API_URL}/deleteroom/${selectedRoom.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        setShowDelete(false);
        setSelectedRoom(null);
        
        if (rooms.length === 1 && pageNum > 1) {
          setPageNum((prev) => prev - 1);
        } else {
          fetchRooms();
        }
      } else {
        alert("Server failed to complete deletion event workflow.");
      }
    } catch (err) {
      console.error(err);
    }
  };

if (loading) {
  return <p className="loading-text">Loading rooms...</p>;
}

return (
  <div>

    <div className="page-header">
      <h2 className="page-title">Rooms</h2>

      <button
        className="primary-button"
        onClick={() => navigate("/rooms/add")}
      >
        Add New Room
      </button>
    </div>

       <div className="filter-panel">
        <form onSubmit={handleFilterSubmit} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Room Name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "140px" }}
          />
          <input
            type="number"
            step="any"
            placeholder="Temperature (C)"
            value={searchTemp}
            onChange={(e) => setSearchTemp(e.target.value)}
            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", maxWidth: "120px" }}
          />
          <input
            type="number"
            step="any"
            placeholder="Humidity (%)"
            value={searchHumidity}
            onChange={(e) => setSearchHumidity(e.target.value)}
            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", maxWidth: "120px" }}
          />
          <input
            type="number"
            step="any"
            placeholder="Light Exp (%)"
            value={searchLight}
            onChange={(e) => setSearchLight(e.target.value)}
            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", maxWidth: "120px" }}
          />
          
          <button type="submit" className="primary-button" style={{ padding: "6px 14px" }}>Filter</button>
        </form>

        <hr style={{ border: "0", borderTop: "1px solid #e0e0e0", margin: "12px 0" }} />

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label style={{marginRight: "5px" }}>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filters-select">
              <option value="roomName">Room Name</option>
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="light_exp">Light Exposure</option>
            </select>
          </div>

          <div>
            <label style={{marginRight: "5px" }}>Direction:</label>
            <select value={sortDirection} onChange={(e) => setSortDirection(Number(e.target.value))} className="filters-select">
              <option value={0}>Ascending</option>
              <option value={1}>Descending</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: "red", padding: "10px", background: "#fde8e8", borderRadius: "4px", marginBottom: "15px", fontWeight: "bold" }}>
          {error}
        </div>
      )}


    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>

      <tbody>
        {rooms.length === 0 && (
          <tr>
            <td colSpan="3" className="table-empty">
              No rooms found
            </td>
          </tr>
        )}

        {rooms.map((room) => (
          <tr key={room.id}>
            <td>{room.room_Name}</td>

            <td>
              <div className="table-actions">
                <button
                  className="action-button"
                  onClick={() =>
                    navigate(`/rooms/edit/${room.id}`)
                  }
                >
                  Edit
                </button>
              </div>
            </td>

            <td>
              <div className="table-actions">
                <button
                  className="action-button danger"
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowDelete(true);
                  }}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

           <div className="paging-form">
            <button
              disabled={pageNum === 1}
              onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}
              style={{ padding: "3px 7px" }}
        >
          &larr; Prev
            </button>
            <span>Page {pageNum}</span>
            <button
              disabled={rooms.length < pageSize}
              onClick={() => setPageNum((prev) => prev + 1)}
              style={{ padding: "3px 7px" }}
        >
          Next &rarr;
            </button>
          </div>
   

    {showDelete && (
      <div className="modal">
        <h3>Are you sure?</h3>

        <p>
          Delete room <strong>{selectedRoom.room_Name}</strong>?
        </p>

        <button onClick={deleteRoom}>Yes</button>
        <button onClick={() => setShowDelete(false)}>No</button>
      </div>
    )}

  </div>
);


}

export default AllRooms; 