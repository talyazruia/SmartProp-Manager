import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import LandlordStatistics from "./LandlordStatistics";

const LOGO_BLUE = "#1a5f9e";
const LOGO_GOLD = "#f2b819";
const TEXT_DARK = "#2c3e50";

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: "sans-serif",
    direction: "rtl",
    textAlign: "right",
  },
  title: {
    color: TEXT_DARK,
    borderBottom: `2px solid ${LOGO_BLUE}`,
    paddingBottom: "10px",
    marginBottom: "20px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  th: {
    backgroundColor: LOGO_BLUE,
    color: "white",
    padding: "12px",
    textAlign: "right",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    verticalAlign: "middle",
  },
  badge: {
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "white",
  },
  btn: {
    border: "none",
    padding: "10px 18px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  actionBtn: {
    border: "none",
    padding: "8px 0",
    width: "90px",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "8px",
    fontSize: "13px",
    textAlign: "center",
    display: "inline-block",
    fontWeight: "bold",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  backBtn: {
    backgroundColor: "#546e7a",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "bold"
  },
  pageContainer: {
    marginTop: "20px",
    padding: "30px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  },
  inputField: {
    display: "block",
    padding: "10px",
    width: "100%",
    maxWidth: "400px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  }
};

export default function LandlordDashboard({ setScreen, user }) {
  const [apartments, setApartments] = useState([]);
  const [view, setView] = useState("main");
  const [selectedApt, setSelectedApt] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const [electricityPrice, setElectricityPrice] = useState("");
  const [previousElectricityPrice, setPreviousElectricityPrice] = useState("");

  const [paymentDetails, setPaymentDetails] = useState({
    bankAccountNumber: "",
    bankBranch: "",
    bankName: ""
  });

  const [rentingAptId, setRentingAptId] = useState(null);
  const [tenantNameInput, setTenantNameInput] = useState("");

  const fetchApartments = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/properties/landlord/${user?.username}`);
      setApartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.username) fetchApartments();
  }, [user]);

  const isAptRented = (apt) => apt && apt.rented === true && apt.tenant && apt.tenant !== "null";

  const handleExportToExcel = () => {
    const dataToExport = paymentHistory.map(pay => ({
      "תאריך": new Date(pay.date).toLocaleDateString('he-IL'),
      "סכום": Number(pay.amount || 0).toFixed(2) + " ₪",
      "קריאת מונה": pay.meterReading,
      "צריכה בקוט״ש": Number(pay.consumptionKwh || 0).toFixed(2),
      "שם שוכר": pay.tenantUsername
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "היסטוריית תשלומים");
    XLSX.writeFile(wb, `היסטוריה_${selectedApt.address}.xlsx`);
  };

  const handleGoToElectricity = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/electricity/price/${user?.username}`);
      const currentPrice = res.data.settingValue || 0;

      setPreviousElectricityPrice(currentPrice);
      setElectricityPrice(currentPrice);
      setView("electricity");
    } catch (err) {
      console.error("שגיאה בטעינת מחיר החשמל", err);
      alert("שגיאה בטעינת מחיר החשמל ❗");
    }
  };

  const updateElectricityPrice = async () => {
    try {
      await axios.put(`http://localhost:8081/api/electricity/price/${user?.username}`, {
        settingValue: Number(electricityPrice),
      });

      alert("מחיר חשמל עודכן בהצלחה! ✔️");
      setView("main");
    } catch (err) {
      alert("שגיאה בעדכון מחיר חשמל");
    }
  };

  const handleGoToPaymentDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/landlords/${user.username}`);

      if (res.data) {
        setPaymentDetails({
          bankAccountNumber: res.data.bankAccountNumber || "",
          bankBranch: res.data.bankBranch || "",
          bankName: res.data.bankName || ""
        });
      }

      setView("paymentDetails");
    } catch (err) {
      setView("paymentDetails");
    }
  };

  const updatePaymentDetails = async () => {
    try {
      await axios.put(`http://localhost:8081/api/landlords/${user.username}/payment-details`, paymentDetails);
      alert("פרטי בנק עודכנו! ✔️");
      setView("main");
    } catch (err) {
      alert("שגיאה בעדכון פרטים");
    }
  };

  const handleShowHistory = async (apt) => {
    try {
      const res = await axios.get(`http://localhost:8081/api/payments/property/${apt.id}`);

      const sortedHistory = (res.data || []).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      setPaymentHistory(sortedHistory);
      setSelectedApt(apt);
      setView("history");
    } catch (err) {
      alert("שגיאה בטעינת היסטוריה");
    }
  };

  const handleShowDetails = (apt) => {
    setSelectedApt(apt);
    setView("details");
  };

  const handleRentApartment = async (id) => {
    try {
      await axios.put(`http://localhost:8081/api/properties/${id}/rent`, null, {
        params: { tenantName: tenantNameInput },
      });

      setRentingAptId(null);
      setTenantNameInput("");
      fetchApartments();
      alert("שוכר שויך בהצלחה!");
    } catch (err) {
      alert("שגיאה בשיוך שוכר");
    }
  };

  const handleVacateApartment = async (id) => {
    if (!window.confirm("האם לפנות את השוכר מהדירה?")) return;

    try {
      await axios.put(`http://localhost:8081/api/properties/${id}/rent`, null, {
        params: { tenantName: "" },
      });

      fetchApartments();
      alert("הדירה פונתה בהצלחה!");
    } catch (err) {
      alert("שגיאה בפינוי הדירה");
    }
  };

  if (view === "history") {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={styles.backBtn} onClick={() => setView("main")}>⬅ חזרה</button>

          <button
            style={{ ...styles.btn, backgroundColor: "#2e7d32", color: "white" }}
            onClick={handleExportToExcel}
          >
            ייצא לאקסל
          </button>
        </div>

        <h2 style={styles.title}>היסטוריית תשלומים: {selectedApt?.address}</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>תאריך</th>
              <th style={styles.th}>סכום שולם</th>
              <th style={styles.th}>קריאת מונה</th>
              <th style={styles.th}>צריכה</th>
              <th style={styles.th}>שם שוכר</th>
            </tr>
          </thead>

          <tbody>
            {paymentHistory.length > 0 ? paymentHistory.map(pay => (
              <tr key={pay.id}>
                <td style={styles.td}>{new Date(pay.date).toLocaleDateString('he-IL')}</td>
                <td style={styles.td}>{Number(pay.amount || 0).toFixed(2)} ₪</td>
                <td style={styles.td}>{pay.meterReading}</td>
                <td style={styles.td}>{Number(pay.consumptionKwh || 0).toFixed(2)} קוט״ש</td>
                <td style={styles.td}>{pay.tenantUsername}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>
                  אין היסטוריית תשלומים לנכס זה
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (view === "details") {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => setView("main")}>
          ⬅ חזרה לניהול נכסים
        </button>

        <h2 style={styles.title}>פרטי נכס: {selectedApt?.address}</h2>

        <div style={styles.pageContainer}>
          <p><strong>כתובת מלאה:</strong> {selectedApt?.address}</p>
          <p><strong>מחיר שכירות חודשי:</strong> {selectedApt?.rentAmount} ₪</p>
          <p><strong>סטטוס נוכחי:</strong> {isAptRented(selectedApt) ? "מושכרת" : "פנויה"}</p>

          {isAptRented(selectedApt) && (
            <p><strong>שם השוכר:</strong> {selectedApt?.tenant}</p>
          )}

          <hr />

          <p><strong>תיאור הנכס:</strong></p>

          <div style={{
            backgroundColor: "#f9f9f9",
            padding: "15px",
            borderRadius: "4px",
            border: "1px solid #eee"
          }}>
            {selectedApt?.description || "אין תיאור זמין עבור נכס זה."}
          </div>
        </div>
      </div>
    );
  }

  if (view === "electricity") {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => setView("main")}>⬅ ביטול</button>

        <div style={{ ...styles.pageContainer, borderTop: `4px solid ${LOGO_GOLD}` }}>
          <h3>עדכון מחיר חשמל</h3>
          <p>מחיר נוכחי במערכת: {previousElectricityPrice} ₪ לקוט"ש</p>

          <input
            type="number"
            step="0.01"
            value={electricityPrice}
            onChange={(e) => setElectricityPrice(e.target.value)}
            style={styles.inputField}
          />

          <button
            style={{ ...styles.btn, backgroundColor: "#2e7d32", color: "white" }}
            onClick={updateElectricityPrice}
          >
            עדכן מחיר
          </button>
        </div>
      </div>
    );
  }

  if (view === "paymentDetails") {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => setView("main")}>⬅ ביטול</button>

        <div style={{ ...styles.pageContainer, borderTop: `4px solid ${LOGO_BLUE}` }}>
          <h3>פרטי חשבון בנק לקבלת תשלומים</h3>

          <label style={styles.label}>שם הבנק:</label>
          <input
            value={paymentDetails.bankName}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
            style={styles.inputField}
          />

          <label style={styles.label}>מספר סניף:</label>
          <input
            value={paymentDetails.bankBranch}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, bankBranch: e.target.value })}
            style={styles.inputField}
          />

          <label style={styles.label}>מספר חשבון:</label>
          <input
            value={paymentDetails.bankAccountNumber}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, bankAccountNumber: e.target.value })}
            style={styles.inputField}
          />

          <button
            style={{ ...styles.btn, backgroundColor: "#2e7d32", color: "white" }}
            onClick={updatePaymentDetails}
          >
            שמור פרטים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ניהול נכסים</h1>

      <div style={{ marginBottom: "25px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          style={{ ...styles.btn, backgroundColor: LOGO_BLUE, color: "white" }}
          onClick={() => setScreen("addApartment")}
        >
          הוספת דירה
        </button>

        <button
          style={{ ...styles.btn, backgroundColor: LOGO_BLUE, color: "white" }}
          onClick={handleGoToElectricity}
        >
          עדכון חשמל
        </button>

        <button
          style={{ ...styles.btn, backgroundColor: LOGO_BLUE, color: "white" }}
          onClick={handleGoToPaymentDetails}
        >
          פרטי תשלום
        </button>
      </div>

      <LandlordStatistics apartments={apartments} />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>כתובת</th>
            <th style={styles.th}>מחיר</th>
            <th style={styles.th}>סטטוס</th>
            <th style={styles.th}>שוכר</th>
            <th style={{ ...styles.th, width: "420px" }}>פעולות</th>
          </tr>
        </thead>

        <tbody>
          {apartments.map((apt) => {
            const rented = isAptRented(apt);

            return (
              <tr key={apt.id}>
                <td style={styles.td}>{apt.address}</td>
                <td style={styles.td}>{apt.rentAmount} ₪</td>

                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: rented ? "#2e7d32" : LOGO_GOLD,
                      color: rented ? "white" : "#222"
                    }}
                  >
                    {rented ? "מושכרת" : "פנויה"}
                  </span>
                </td>

                <td style={styles.td}>
                  {rentingAptId === apt.id ? (
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={tenantNameInput}
                        placeholder="שם שוכר"
                        onChange={(e) => setTenantNameInput(e.target.value)}
                        style={{ width: "90px", padding: "4px" }}
                      />

                      <button
                        onClick={() => handleRentApartment(apt.id)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: '#2e7d32',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '3px',
                          fontWeight: 'bold'
                        }}
                      >
                        שמור
                      </button>

                      <button
                        onClick={() => setRentingAptId(null)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: '#757575',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '3px',
                          fontWeight: 'bold'
                        }}
                      >
                        ביטול
                      </button>
                    </div>
                  ) : (
                    rented ? apt.tenant : "—"
                  )}
                </td>

                <td style={styles.td}>
                  <button
                    style={{ ...styles.actionBtn, backgroundColor: "#457b9d", color: "white" }}
                    onClick={() => handleShowHistory(apt)}
                  >
                    היסטוריה
                  </button>

                  <button
                    style={{ ...styles.actionBtn, backgroundColor: LOGO_BLUE, color: "white" }}
                    onClick={() => handleShowDetails(apt)}
                  >
                    פרטים
                  </button>

                  {!rented ? (
                    <button
                      style={{ ...styles.actionBtn, backgroundColor: LOGO_GOLD, color: "#222" }}
                      onClick={() => setRentingAptId(apt.id)}
                    >
                      שייך
                    </button>
                  ) : (
                    <button
                      style={{ ...styles.actionBtn, backgroundColor: LOGO_GOLD, color: "#222" }}
                      onClick={() => handleVacateApartment(apt.id)}
                    >
                      פנה
                    </button>
                  )}

                  <button
                    style={{ ...styles.actionBtn, backgroundColor: "#c62828", color: "white" }}
                    onClick={() => {}}
                  >
                    מחק
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: "40px" }}>
        <button
          style={{
            ...styles.btn,
            backgroundColor: "#eceff1",
            color: "#455a64",
            border: "1px solid #cfd8dc"
          }}
          onClick={() => setScreen("login")}
        >
          התנתק מהמערכת
        </button>
      </div>
    </div>
  );
}