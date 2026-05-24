import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from "xlsx";
import TenantElectricityStats from "./TenantElectricityStats";

const LOGO_BLUE = "#1a5f9e";
const LOGO_GOLD = "#f2b819";

const styles = {
  container: {
     padding: '20px',
     maxWidth: '900px',
     margin: '0 auto',
     fontFamily: 'sans-serif',
     direction: 'rtl',
     textAlign: 'center'
    },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
    marginBottom: '20px',
    borderRight: `5px solid ${LOGO_BLUE}`,
    textAlign: 'right'
  },
  title: {
    fontSize: '26px',
    color: '#2c3e50',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
  details: {
    fontSize: '16px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '10px'
  },
  statusBad: {
    color: '#c62828',
    fontWeight: 'bold',
    backgroundColor: '#ffebee',
    padding: '5px 12px',
    borderRadius: '4px',
    display: 'inline-block',
    marginTop: '5px'
  },
  uploadButton: {
    backgroundColor: LOGO_BLUE,
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    marginBottom: '15px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  secondaryBtn: {
    backgroundColor: '#eceff1',
    color: '#37474f',
    border: '1px solid #cfd8dc',
    padding: '12px 20px',
    fontSize: '16px',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 'bold',
    marginBottom: '10px'
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
    fontWeight: "bold",
    float: "right"
  },
  excelBtn: {
    backgroundColor: "#2e7d32",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    float: "left"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  th: {
    backgroundColor: LOGO_BLUE,
    color: "white",
    padding: "12px",
    textAlign: "right"
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "right"
  }
};

export default function TenantDetails({ setScreen, user }) {
  const [apartment, setApartment] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [view, setView] = useState("main");

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const resApt = await axios.get("http://localhost:8081/api/properties/all");
        const myApt = resApt.data.find(p => String(p.id) === String(user?.apartmentId));
        setApartment(myApt);

        if (myApt) {
          const resHistory = await axios.get(`http://localhost:8081/api/payments/property/${myApt.id}`);
          const sorted = (resHistory.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
          setPaymentHistory(sorted);
        }
      } catch (err) {
        console.error("שגיאה בטעינת נתונים", err);
      }
    };

    if (user) fetchTenantData();
  }, [user]);

  const handleExportToExcel = () => {
    const dataToExport = paymentHistory.map(pay => ({
      "תאריך": new Date(pay.date).toLocaleDateString('he-IL'),
      "סכום שולם": pay.amount + " ₪",
      "קריאת מונה": pay.meterReading,
      "צריכה בקוט״ש": Number(pay.consumptionKwh || 0).toFixed(2)
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "היסטוריית תשלומים");
    XLSX.writeFile(wb, `היסטוריית_תשלומים_${user?.name}.xlsx`);
  };

  if (view === "history") {
    return (
      <div style={{ ...styles.container, maxWidth: '900px' }}>
        <div style={{ overflow: 'hidden', marginBottom: '10px' }}>
          <button style={styles.backBtn} onClick={() => setView("main")}>⬅ חזרה</button>
          <button style={styles.excelBtn} onClick={handleExportToExcel}>ייצא לאקסל</button>
        </div>

        <h2 style={{
          textAlign: 'right',
          borderBottom: `2px solid ${LOGO_BLUE}`,
          paddingBottom: '10px',
          color: '#2c3e50'
        }}>
          היסטוריית תשלומים מלאה
        </h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>תאריך</th>
              <th style={styles.th}>סכום שולם</th>
              <th style={styles.th}>קריאת מונה</th>
              <th style={styles.th}>צריכה</th>
            </tr>
          </thead>

          <tbody>
            {paymentHistory.length > 0 ? paymentHistory.map((pay) => (
              <tr key={pay.id}>
                <td style={styles.td}>{new Date(pay.date).toLocaleDateString('he-IL')}</td>
                <td style={styles.td}>{Number(pay.amount || 0).toFixed(2)} ₪</td>
                <td style={styles.td}>{pay.meterReading}</td>
                <td style={styles.td}>{Number(pay.consumptionKwh || 0).toFixed(2)} קוט״ש</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ ...styles.td, textAlign: "center" }}>
                  טרם בוצעו תשלומים
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>שלום, {user?.name}</h1>

      <div style={styles.card}>
        <h3 style={{ color: LOGO_BLUE, marginTop: 0 }}>פרטי הדירה שלך:</h3>
        <p style={styles.details}>{apartment?.address || "טוען נתוני כתובת..."}</p>

        <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '15px 0' }} />

        <h3 style={{ color: '#c62828', marginTop: 0 }}>סטטוס תשלום נוכחי:</h3>
        <span style={styles.statusBad}>ממתין לעדכון מונה</span>
      </div>

      <TenantElectricityStats paymentHistory={paymentHistory} />

      <button style={styles.uploadButton} onClick={() => setScreen("upload")}>
        העלאת קריאת מונה חדשה
      </button>

      <button style={styles.secondaryBtn} onClick={() => setView("history")}>
        הצג היסטוריית תשלומים וייצוא
      </button>

      <div style={{ marginTop: "45px" }}>
        <button
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#eceff1",
            color: "#546e7a",
            fontWeight: 'bold'
          }}
          onClick={() => setScreen("login")}
        >
          התנתק
        </button>
      </div>
    </div>
  );
}