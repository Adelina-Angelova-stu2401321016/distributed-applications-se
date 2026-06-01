import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const API_URL = "http://localhost:5204/api";


function EditExhibit(){
  const navigate = useNavigate();
  const { id } = useParams(); 
  const { user } = useAuth();

  const token = localStorage.getItem("token");
  const roleId = Number(user?.roleId);
  const userId = Number(user?.userId); 

  const [curators, setCurators] = useState([]);
  const [loading, setLoading] = useState(roleId === 100001);
  const [error, setError] = useState("");
  const [exhibitRooms, setExhibitRooms] = useState([]);
  const [otherRooms, setOtherRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [exhibitItems, setExhibitItems] = useState([]);
  const [otherItems, setOtherItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");

const [roomSearchName, setRoomSearchName] = useState("");
  const [roomSearchDate, setRoomSearchDate] = useState("");
  const [appliedRoomName, setAppliedRoomName] = useState("");
  const [appliedRoomDate, setAppliedRoomDate] = useState("");
  
  const [roomsPageNum, setRoomsPageNum] = useState(1);
  const [roomsPageSize] = useState(3); 
  const [roomsSortBy, setRoomsSortBy] = useState("roomName");
  const [roomsSortDirection, setRoomsSortDirection] = useState(0);

  const [itemSearchName, setItemSearchName] = useState("");
  const [itemSearchDate, setItemSearchDate] = useState("");
  const [appliedItemName, setAppliedItemName] = useState("");
  const [appliedItemDate, setAppliedItemDate] = useState("");
  
  const [itemsPageNum, setItemsPageNum] = useState(1);
  const [itemsPageSize] = useState(3);
  const [itemsSortBy, setItemsSortBy] = useState("itemName");
  const [itemsSortDirection, setItemsSortDirection] = useState(0);

  const [form, setForm] = useState({
    id: "",
    title: "",
    startDate: "",
    endDate: "",
    description: "",
    entryPrice: "",
    curatorId: ""
  });

 useEffect(() => {
    fetchExhibit();
    fetchOtherRooms();
    fetchOtherItems();
  }, [id]);

  useEffect(() => {
    if (roleId === 100001) fetchCurators();
  }, [roleId]);

useEffect(() => {
    fetchExhibitRooms();
  }, [id, roomsPageNum, roomsSortBy, roomsSortDirection, appliedRoomName, appliedRoomDate]);
 useEffect(() => {
    fetchExhibitItems();
  }, [id, itemsPageNum, itemsSortBy, itemsSortDirection, appliedItemName, appliedItemDate]);


    const fetchCurators = async () => {
      try {
        const response = await fetch(`${API_URL}/users/getcurators`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setCurators(data);
      } catch {
        setError("Failed to load curators");
        
      } finally {
        setLoading(false);
      }
    };
  
    const fetchExhibit = async () => {
    try {
      const response = await fetch(
        `${API_URL}/exhibit/getexhibit/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        setError("Failed to load exhibit");
        return;
      }

      const data = await response.json();

      setForm({
        id: data.id,
        title: data.title,
        startDate: data.start_Date?.split("T")[0],
        endDate: data.end_Date?.split("T")[0],
        description: data.description,
        entryPrice: data.entry_Price,
        curatorId: data.curatorID
      });
    } catch {
      setError("Failed to load exhibit");
    } finally {
      setLoading(false);
    }
  };

   const updateExhibit = async () => {

    setError("");

    const curatorIdToSend = Number(form.curatorId); // curator creates for themselves

    if (!curatorIdToSend) {
      setError("Curator is required" + curatorIdToSend);
      return;
    }
    try{
            const response = await fetch(
      `${API_URL}/exhibit/editexhibit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ID: form.id,
          Title: form.title,
          Start_Date: form.startDate,
          End_Date: form.endDate,
          Description: form.description,
          Entry_Price: Number(form.entryPrice),
          CuratorID: Number(form.curatorId)
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
        setError(errData.message || "Failed to commit exhibit updates.");
        return;
    }

    navigate("/exhibits/all");

    }catch (err) {
      setError("Network fault encountered while executing update changes.");
    }

  };
  
   const fetchExhibitRooms = async () => {
    try {
      const params = new URLSearchParams({
        pageNum: roomsPageNum.toString(),
        pageSize: roomsPageSize.toString(),
        sortBy: roomsSortBy,
        sortDirection: roomsSortDirection.toString(),
      });

      if (appliedRoomName.trim() !== "") {
        params.append("roomName", appliedRoomName.trim());
      }
      if (appliedRoomDate !== "") {
        params.append("dtCreated", appliedRoomDate);
      }

      const res = await fetch(`${API_URL}/exhibitroom/get-exhibitrooms/${id}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExhibitRooms(data);
      }
    } catch (err) {
      console.error("Error collecting linked floor maps:", err);
    }
  };

    const fetchOtherRooms = async () => {
        try {
      const res = await fetch(`${API_URL}/exhibitroom/get-other-rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOtherRooms(data);
      }
    } catch (err) {
      console.error("Error setting supplemental gallery arrays:", err);
    }
  };

const handleRoomSearchSubmit = (e) => {
    e.preventDefault();
    setRoomsPageNum(1);
    setAppliedRoomName(roomSearchName);
    setAppliedRoomDate(roomSearchDate);
  };

const addRoomToExhibit = async () => {
   if (!selectedRoomId) return;
    try {
      const res = await fetch(`${API_URL}/exhibitroom/add-exhibitroom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ExhibitID: Number(id),
          RoomID: Number(selectedRoomId)
        })
      });

      if (res.ok) {
       setSelectedRoomId("");
        setRoomsPageNum(1);
        await fetchExhibitRooms();
        await fetchOtherRooms();
      } else {
        setError("Could not complete target room assignment mapping.");
      }
    } catch (err) {
      setError("Network issue encountered while appending room records.");
    }
};

const removeRoom = async (exhibitRoomId) => {
  const confirmed = window.confirm(
    "Are you sure you want to remove this room from the exhibit?"
  );

  if (!confirmed) return;
  try {
      const res = await fetch(`${API_URL}/exhibitroom/delete-exhibitroom/${exhibitRoomId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
       if (exhibitRooms.length === 1 && roomsPageNum > 1) {
          setRoomsPageNum((prev) => prev - 1);
        } else {
          await fetchExhibitRooms();
        }
        await fetchOtherRooms();
      }
    } catch (err) {
      setError("Failed to disconnect selected exhibit room reference connection.");
    }
  };

const fetchExhibitItems = async () => {
 try {
      const params = new URLSearchParams({
        pageNum: itemsPageNum.toString(),
        pageSize: itemsPageSize.toString(),
        sortBy: itemsSortBy,
        sortDirection: itemsSortDirection.toString(),
      });

      if (appliedItemName.trim() !== "") {
        params.append("itemName", appliedItemName.trim());
      }
      if (appliedItemDate !== "") {
        params.append("dtCreated", appliedItemDate);
      }

      const res = await fetch(`${API_URL}/exhibititem/get-exhibititems/${id}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setExhibitItems(await res.json());
      }
    } catch (err) {
      console.error("Error fetching items bound to exhibit:", err);
    }  
  };

const fetchOtherItems = async () => {
   try {
      const res = await fetch(`${API_URL}/exhibititem/get-other-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setOtherItems(await res.json());
      }
    } catch (err) {
      console.error("Error identifying item collection differentials:", err);
    }
  };

  const handleItemSearchSubmit = (e) => {
    e.preventDefault();
    setItemsPageNum(1);
    setAppliedItemName(itemSearchName);
    setAppliedItemDate(itemSearchDate);
  };

const addItemToExhibit = async () => {
    if (!selectedItemId) return;

       try {
      const res = await fetch(`${API_URL}/exhibititem/add-exhibititem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ExhibitID: Number(id),
          ItemID: Number(selectedItemId)
        })
      });

      if (res.ok) {
         setSelectedItemId("");
        setItemsPageNum(1);
        await fetchExhibitItems();
        await fetchOtherItems();
      }
    } catch (err) {
      setError("Network timeout occurred while cataloging item mapping rules.");
    }
  };

const removeItem = async (exhibitItemId) => {
    if (!window.confirm("Remove this item?")) return;

      try {
      const res = await fetch(`${API_URL}/exhibititem/delete-exhibititem/${exhibitItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
       if (exhibitItems.length === 1 && itemsPageNum > 1) {
          setItemsPageNum((prev) => prev - 1);
        } else {
          await fetchExhibitItems();
        }
        await fetchOtherItems();
      }
    } catch (err) {
      setError("Encountered trouble processing deletion request for the requested item.");
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

    <div className="mixed-page">
            <h2 className="page-title">
        Edit Exhibit {form.title}
      </h2>
      <div className="section-card">
       {error && <p className="form-error" style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

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

      {roleId === 100002 && (
        <p>
          Curator: <strong>{user.fName}</strong>
        </p>
      )}

      <div className="form-actions">
        <button onClick={updateExhibit}>Save Changes</button>
        <button onClick={() => navigate("/exhibits/all")}>
          Cancel
        </button>
      </div>
    </div>
<div className="relationship-grid">
  {/* ===== Rooms Section ===== */}
    <div className="section-card">
      <h3 className="section-header">Exhibit Rooms</h3>

      <div className="inline-add">
        <select
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
        >
          <option value="">-- Add room --</option>
          {otherRooms.map((room) => (
            <option key={room.roomID} value={room.roomID}>
              {room.room_Name}
            </option>
          ))}
        </select>

        <button
          className="primary-button"
          onClick={addRoomToExhibit}
          disabled={!selectedRoomId}
        >
          Add Room
        </button>
      </div>
<div className="filter-panel">
              <form onSubmit={handleRoomSearchSubmit} class="filters-form">
                <input 
                  type="text" 
                  placeholder="Filter name..." 
                  value={roomSearchName} 
                  onChange={(e) => setRoomSearchName(e.target.value)} 
                  className="filters-input"
                />
                <input 
                  type="date" 
                  value={roomSearchDate} 
                  onChange={(e) => setRoomSearchDate(e.target.value)} 
                  className="filters-input"
                />
                <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
              </form>
              <div class="filters-form">
                <div>
                  <label style={{marginRight: "5px" }}>Sort by: </label>
                  <select value={roomsSortBy} onChange={(e) => setRoomsSortBy(e.target.value)} className="filters-select">
                    <option value="roomName">Room Name</option>
                    <option value="dtCreated">Date Assigned</option>
                  </select>
                </div>
                <div>
                  <label style={{marginRight: "5px" }}>Direction: </label>
                  <select value={roomsSortDirection} onChange={(e) => setRoomsSortDirection(Number(e.target.value))} className="filters-select">
                    <option value={0}>Ascending</option>
                    <option value={1}>Descending</option>
                  </select>
                </div>
              </div>
            </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Room Name</th>
            <th>Remove</th>
          </tr>
        </thead>

        <tbody>
          {exhibitRooms.length === 0 ? (
            <tr>
              <td colSpan="2" className="table-empty">
                No rooms assigned
              </td>
            </tr>
          ) : (
            exhibitRooms.map((er) => (
              <tr key={er.id}>
                <td>{er.room_Name}</td>
                <td>
                  <button
                    className="action-button danger"
                    onClick={() => removeRoom(er.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="paging-form">
              <button disabled={roomsPageNum === 1} onClick={() => setRoomsPageNum(prev => Math.max(prev - 1, 1))} style={{ padding: "3px 7px" }}>
                &larr; Prev</button>
              <span>Page {roomsPageNum}</span>
              <button disabled={exhibitRooms.length < roomsPageSize} onClick={() => setRoomsPageNum(prev => prev + 1)}style={{ padding: "3px 7px" }}
        >
          Next &rarr;
</button>
            </div>
    </div>

    {/* ===== Items Section ===== */}
    <div className="section-card">
      <h3 className="section-header">Exhibit Items</h3>

      <div className="inline-add">
        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
        >
          <option value="">-- Add item --</option>
          {otherItems.map((i) => (
            <option key={i.itemID} value={i.itemID}>
              {i.item_Name}
            </option>
          ))}
        </select>

        <button
          className="primary-button"
          onClick={addItemToExhibit}
          disabled={!selectedItemId}
        >
          Add Item
        </button>
      </div>
  <div className="filter-panel">
              <form onSubmit={handleItemSearchSubmit} class="filters-form">
                <input 
                  type="text" 
                  placeholder="Filter item name..." 
                  value={itemSearchName} 
                  onChange={(e) => setItemSearchName(e.target.value)}
                  className="filters-input"
                />
                <input 
                  type="date" 
                  value={itemSearchDate} 
                  onChange={(e) => setItemSearchDate(e.target.value)} 
                  className="filters-input"
                />
                <button type="submit" className="primary-button" style={{ padding: "6px 12px" }}>Filter</button>
              </form>
              <div class="filters-form">
                <div>
                  <label style={{marginRight: "5px" }}>Sort by: </label>
                  <select value={itemsSortBy} onChange={(e) => setItemsSortBy(e.target.value)} className="filters-select">
                    <option value="itemName">Item Name</option>
                    <option value="dtCreated">Date Assigned</option>
                  </select>
                </div>
                <div>
                  <label style={{marginRight: "5px" }}>Direction: </label>
                  <select value={itemsSortDirection} onChange={(e) => setItemsSortDirection(Number(e.target.value))} className="filters-select">
                    <option value={0}>Ascending</option>
                    <option value={1}>Descending</option>
                  </select>
                </div>
              </div>
            </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Remove</th>
          </tr>
        </thead>

        <tbody>
          {exhibitItems.length === 0 ? (
            <tr>
              <td colSpan="2" className="table-empty">
                No items added to the exhibit
              </td>
            </tr>
          ) : (
            exhibitItems.map((i) => (
              <tr key={i.id}>
                <td>{i.item_Name}</td>
                <td>
                  <button
                    className="action-button danger"
                    onClick={() => removeItem(i.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
       <div className="paging-form">
              <button disabled={itemsPageNum === 1} onClick={() => setItemsPageNum(prev => Math.max(prev - 1, 1))} style={{ padding: "3px 7px" }}
        >
          &larr; Prev</button>
              <span>Page {itemsPageNum}</span>
              <button disabled={exhibitItems.length < itemsPageSize} onClick={() => setItemsPageNum(prev => prev + 1)} style={{ padding: "3px 7px" }}
        >
          Next &rarr;
          </button>
      </div>
  
</div>

    </div>

    </div>

  </div>
);



}


export default EditExhibit; 