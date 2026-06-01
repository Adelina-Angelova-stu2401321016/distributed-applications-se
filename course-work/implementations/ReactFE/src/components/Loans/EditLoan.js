import { useEffect, useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";


const API_URL = "http://localhost:5204/api";

function EditLoan(){
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const roleId = Number(user.roleId);
    const ADMIN_ROLE_ID = 100001;   
    const isAdmin = roleId === ADMIN_ROLE_ID;
    
    const token = localStorage.getItem("token");
    const [partners, setPartners] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState([]); 
    const [loanItems, setLoanItems] = useState([]);
    const [deleteLoanItem, setDeleteLoanItem] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLoanItemId, setSelectedLoanItemId] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
 
const [itemSearchName, setItemSearchName] = useState("");
const [itemSearchDate, setItemSearchDate] = useState("");
const [appliedItemName, setAppliedItemName] = useState("");
const [appliedItemDate, setAppliedItemDate] = useState("");
const [itemPageNum, setItemPageNum] = useState(1);
const [itemPageSize] = useState(5); 
const [itemSortBy, setItemSortBy] = useState("itemName");
const [itemSortDirection, setItemSortDirection] = useState(0);
    const [form, setForm] = useState({
    ID: "",
    partnerID: "",
    loanType: "",
    startDate: "",
    endDate: ""
    });
 
    useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
  fetchLoanItems();
}, [id, itemPageNum, itemSortBy, itemSortDirection, appliedItemName, appliedItemDate]);

    const loadData = async () => {
        try {
          setLoading(true);
          setError("");
          const paginationParams = "pageNum=1&pageSize=100&sortBy=partnerName&sortDirection=0";
          const itemPaginationParams = "pageNum=1&pageSize=100&sortBy=itemName&sortDirection=0";

          const [loanRes, partnersRes, itemsRes] = await Promise.all([
            fetch(`${API_URL}/loan/getloan/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				}),
            fetch(`${API_URL}/partner/getpartners?${paginationParams}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				}), 
            fetch(`${API_URL}/item/getitems?${itemPaginationParams}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
				})
        ]);
    
          if (!loanRes.ok) throw new Error("Failed to load loan");
          if (!partnersRes.ok) throw new Error("Failed to load partners");
          if (!itemsRes.ok) throw new Error("Failed to load items");
         
    
          const loan = await loanRes.json();
          const partnersData = await partnersRes.json();
          const itemsData = await itemsRes.json(); 
    
          setPartners(partnersData);
          setItems(itemsData); 

          setForm({
            id: loan.id,
            partnerID: loan.partnerID,
            loanType: loan.loanType,
            startDate: loan.startDate?.slice(0, 10),
            endDate: loan.endDate?.slice(0, 10)
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
      `${API_URL}/loan/editloan`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ID: Number(form.id),
          PartnerID: Number(form.partnerID),
          LoanType: form.loanType,
          StartDate: form.startDate,
          EndDate: form.endDate
        })
      }
    );

    if (!response.ok) {
      setError("Failed to update loan");
      return;
    }

    navigate("/loans/all");
  };

  const fetchLoanItems = async () => {
 try {
    const params = new URLSearchParams({
      pageNum: itemPageNum.toString(),
      pageSize: itemPageSize.toString(),
      sortBy: itemSortBy,
      sortDirection: itemSortDirection.toString()
    });

    if (appliedItemName.trim() !== "") {
      params.append("itemName", appliedItemName.trim());
    }
    if (appliedItemDate !== "") {
      params.append("dtCreated", appliedItemDate);
    }

    const res = await fetch(
      `${API_URL}/loanitem/getloanitems/${id}?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if(!res.ok){
      setLoanItems(""); 
    }
    const data = await res.json();
    setLoanItems(data);
  } catch (err) {
    console.error(err);
    setError("Failed to load items");
    setLoanItems([]);
  } };

  const handleItemSearch = (e) => {
  e.preventDefault();
  setItemPageNum(1); 
  setAppliedItemName(itemSearchName);
  setAppliedItemDate(itemSearchDate);
};

  const submitLoanItem = async () => {
  if (!selectedItemId) return;

  const res = await fetch(
    `${API_URL}/loanitem/addloanitem`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        LoanID: Number(id),
        ItemID: Number(selectedItemId)
      })
    }
  );

  if (!res.ok) {
    setError("Failed to add item to loan");
    return;
  }

  setShowAddModal(false);
  setSelectedLoanItemId("");
  fetchLoanItems();
};

  const confirmDeleteLoanItem = async () => {
    await fetch(
      `${API_URL}/loanitem/deleteloanitem/${deleteLoanItem.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setDeleteLoanItem(null);
    fetchLoanItems();
  };


  if (!isAdmin) {
    return <p>Access denied</p>;
  }
  if (isAdmin && loading) return <p>Loading...</p>;

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

    <div className="mixed-page">

  {/* ===== Header ===== */}
  <div className="page-header">
    

    <h2 className="page-title">Edit Loan</h2>
  </div>

  {/* ===== Loan Form ===== */}
  <div className="section-card">

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
      <button onClick={submitUpdate}>Save</button>
      <button onClick={() => navigate("/loans/all")}>
        Cancel
      </button>
    </div>

  </div>

  {/* ===== Loan Items Section ===== */}
  <div className="section-card">
    <h3 className="section-header">Loan Items</h3>

    <button
      className="primary-button"
      onClick={() => setShowAddModal(true)}
    >
      Add Item to Loan
    </button>

<div className="filter-panel">
    <form onSubmit={handleItemSearch} class="filters-form">
      <input
        type="text"
        placeholder="Filter by Item Name..."
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
      <label style={{marginRight: "5px" }}>Sort By:</label>
      <select value={itemSortBy} onChange={(e) => setItemSortBy(e.target.value)} className="filters-select">
        <option value="itemName">Item Name</option>
        <option value="dtCreated">Date Added</option>
      </select>
<label style={{marginRight: "5px" }}>Direction:</label>
      <select value={itemSortDirection} onChange={(e) => setItemSortDirection(Number(e.target.value))} className="filters-select">
        <option value={0}>Ascending</option>
        <option value={1}>Descending</option>
      </select>
    </div>
  </div>

    <table className="data-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Delete</th>
        </tr>
      </thead>

      <tbody>
        {loanItems.length === 0 ? (
          <tr>
            <td colSpan="2" className="table-empty">
              No loan items
            </td>
          </tr>
        ) : (
          loanItems.map((li) => (
            <tr key={li.id}>
              <td>{li.itemName}</td>
              <td>
                <button
                  className="action-button danger"
                  onClick={() => setDeleteLoanItem(li)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>

    <div className="paging-form">
    <button
      disabled={itemPageNum === 1}
      onClick={() => setItemPageNum((prev) => Math.max(prev - 1, 1))}
      style={{ padding: "3px 7px" }}
        >
          &larr; Prev
    </button>
    <span>Page {itemPageNum}</span>
    <button
      disabled={loanItems.length < itemPageSize}
      onClick={() => setItemPageNum((prev) => prev + 1)}
      style={{ padding: "3px 7px" }}
        >
          Next &rarr;
    </button>
  </div>
  </div>

  {/* ===== Add Loan Item Modal ===== */}
  {showAddModal && (
    <div className="modal">
      <h4>Add Item to Loan</h4>

      <div className="form-group">
        <label>Item</label>
        <select
          value={selectedItemId}
          onChange={(e) =>
            setSelectedItemId(e.target.value)
          }
          style={{ width: "320px"}}
        >
          <option value="">-Select Item-</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.item_Name}
            </option>
          ))}
        </select>
      </div>

      <button onClick={submitLoanItem}>Add</button>
      <button onClick={() => setShowAddModal(false)}>
        Cancel
      </button>
    </div>
  )}

  {/* ===== Delete Loan Item Modal ===== */}
  {deleteLoanItem && (
    <div className="modal">
      <p>
        Are you sure you want to delete
        <strong> {deleteLoanItem.itemName}</strong>?
      </p>

      <button onClick={confirmDeleteLoanItem}>Yes</button>
      <button onClick={() => setDeleteLoanItem(null)}>
        No
      </button>
    </div>
  )}

</div>

  </div>);

    
}

export default EditLoan; 
