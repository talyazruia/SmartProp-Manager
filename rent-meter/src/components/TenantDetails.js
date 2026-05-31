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
  clickableCard: { 
    backgroundColor: '#fff', 
    borderRadius: '12px', 
    padding: '20px', 
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)', 
    marginBottom: '15px', 
    borderRight: `5px solid ${LOGO_GOLD}`, 
    textAlign: 'right', 
    cursor: 'pointer', 
    transition: 'transform 0.2s, box-shadow 0.2s' 
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
  statusBadge: { 
    fontWeight: 'bold', 
    padding: '6px 14px', 
    borderRadius: '4px', 
    display: 'inline-block', 
    marginTop: '5px', 
    fontSize: '14px' 
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
  const [selectedApartment, setSelectedApartment] = useState(null); 
  const [allApartments, setAllApartments] = useState([]); 
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [view, setView] = useState("list"); 

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const resApt = await axios.get("http://localhost:8081/api/properties/all");
        
        const userEmail = user?.email || user?.username;
        const myApts = resApt.data.filter(p => 
          String(p.id) === String(user?.apartmentId) || 
          (p.tenant && String(p.tenant).trim().toLowerCase() === String(userEmail).trim().toLowerCase())
        );

        setAllApartments(myApts);

        if (myApts.length === 1) {
          handleSelectApartment(myApts[0]);
        }
      } catch (err) {
        console.error("שגיאה בטעינת נתוני דירות", err);
      }
    };

    if (user) fetchTenantData();
  }, [user]);

  const handleSelectApartment = async (apt) => {
    setSelectedApartment(apt);
    setView("main");
    try {
      const resHistory = await axios.get(`http://localhost:8081/api/payments/property/${apt.id}`);
      const sorted = (resHistory.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setPaymentHistory(sorted);
    } catch (err) {
      console.error("שגיאה בטעינת היסטוריית התשלומים לדירה זו", err);
      setPaymentHistory([]);
    }
  };

  // 🔥 הלוגיקה החדשה והמדויקת לפי בקשתך
  const renderStatus = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();
    const currentUserEmail = (user?.username || user?.email || "").trim().toLowerCase();

    // מחפשים רשומה לחודש הנוכחי שמשויכת ספציפית ל-tenantUsername של הדייר הנוכחי
    const currentMonthPayment = paymentHistory.find(pay => {
      const payDate = new Date(pay.date);
      // תמיכה בשני הפורמטים האפשריים לשם השדה: tenantUsername או tenant_username
      const payTenant = (pay.tenantUsername || pay.tenant_username || "").trim().toLowerCase();
      
      return (
        payDate.getMonth() === currentMonth && 
        payDate.getFullYear() === currentYear &&
        payTenant === currentUserEmail
      );
    });

    // 1. תנאי ראשון: אם אין רשומה לחודש הנוכחי, או שיש רשומה אבל שדה שם המשתמש ריק/לא תואם
    if (!currentMonthPayment) {
      return (
        <span style={{ ...styles.statusBadge, backgroundColor: '#ffebee', color: '#c62828' }}>
          ממתין להעלאת מונה ⏳
        </span>
      );
    }

    // 2. תנאי שני: יש רשומה עם שם המשתמש, אך הסטטוס שלה עדיין לא אושר על ידי המשכיר
    const isApproved = currentMonthPayment.approved === true || currentMonthPayment.isApproved === true;
    if (!isApproved) {
      return (
        <span style={{ ...styles.statusBadge, backgroundColor: '#fff3cd', color: '#856404' }}>
          ממתין לאישור המשכיר 🔄
        </span>
      );
    }

    // 3. תנאי שלישי: יש רשומה תואמת לחודש והיא סומנה כמאושרת (שולמה)
    return (
      <span style={{ ...styles.statusBadge, backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
        שולם ✔️
      </span>
    );
  };

  const handleExportToExcel = () => {
    const dataToExport = paymentHistory.map(pay => ({
      "תאריך": new Date(pay.date).toLocaleDateString('he-IL'),
      "סכום שולם": pay.amount + " ₪",
      "קריאת מונה": pay.meterReading,
      "צריכה בקוט״ש": Number(pay.consumptionKwh || 0).toFixed(2),
      "סטטוס": (pay.approved || pay.isApproved) ? "אושר" : "ממתין לאישור"
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "היסטוריית תשלומים");
    XLSX.writeFile(wb, `היסטוריית_תשלומים_${selectedApartment?.address || user?.name}.xlsx`);
  };

  if (view === "history") {
    return (
      <div style={{ ...styles.container, maxWidth: '900px' }}>
        <div style={{ overflow: 'hidden', marginBottom: '10px' }}>
          <button style={styles.backBtn} onClick={() => setView("main")}>⬅ חזרה לפרטי הדירה</button>
          <button style={styles.excelBtn} onClick={handleExportToExcel}>ייצא לאקסל</button>
        </div>

        <h2 style={{ textAlign: 'right', borderBottom: `2px solid ${LOGO_BLUE}`, paddingBottom: '10px', color: '#2c3e50' }}>
          היסטוריית תשלומים עבור: {selectedApartment?.address}
        </h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>תאריך</th>
              <th style={styles.th}>סכום שולם</th>
              <th style={styles.th}>קריאת מונה</th>
              <th style={styles.th}>צריכה</th>
              <th style={styles.th}>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.length > 0 ? paymentHistory.map((pay) => (
              <tr key={pay.id}>
                <td style={styles.td}>{new Date(pay.date).toLocaleDateString('he-IL')}</td>
                <td style={styles.td}>{Number(pay.amount || 0).toFixed(2)} ₪</td>
                <td style={styles.td}>{pay.meterReading}</td>
                <td style={styles.td}>{Number(pay.consumptionKwh || 0).toFixed(2)} קוט״ש</td>
                <td style={styles.td}>
                  {(pay.approved || pay.isApproved) ? "מאושר ✔️" : "ממתין לאישור המשכיר ⏳"}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: "center" }}>
                  טרם בוצעו תשלומים עבור דירה זו
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (view === "list" || allApartments.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>שלום, {user?.name || "דייר יקר"}</h1>
        <h3 style={{ textAlign: 'right', color: '#2c3e50', marginBottom: '20px' }}>בחר דירה להצגת נתונים:</h3>

        {allApartments.length > 0 ? (
          allApartments.map((apt) => (
            <div 
              key={apt.id} 
              style={styles.clickableCard}
              onClick={() => handleSelectApartment(apt)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <h3 style={{ color: LOGO_BLUE, marginTop: 0 }}>{apt.description || "דירה למגורים"}</h3>
              <p style={{ margin: '5px 0', color: '#555' }}><strong>כתובת:</strong> {apt.address}</p>
              <p style={{ margin: '5px 0', color: '#777', fontSize: '14px' }}>לחץ לצפייה בסטטיסטיקות ודיווח מונה ⬅</p>
            </div>
          ))
        ) : (
          <div style={styles.card}>
            <p style={{ ...styles.details, textAlign: 'center' }}>לא נמצאו דירות המשויכות אליך במערכת.</p>
          </div>
        )}

        <div style={{ marginTop: "45px" }}>
          <button style={{ padding: "10px 20px", cursor: "pointer", border: "none", borderRadius: "4px", backgroundColor: "#eceff1", color: "#546e7a", fontWeight: 'bold' }} onClick={() => setScreen("login")}>
            התנתק
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ overflow: 'hidden' }}>
        {allApartments.length > 1 && (
          <button style={styles.backBtn} onClick={() => setView("list")}>▤ החלף דירה</button>
        )}
      </div>

      <h1 style={styles.title}>שלום, {user?.name}</h1>

      <div style={styles.card}>
        <h3 style={{ color: LOGO_BLUE, marginTop: 0 }}>פרטי הדירה הנבחרת:</h3>
        <p style={styles.details}><strong>כתובת:</strong> {selectedApartment?.address}</p>
        <p style={styles.details}><strong>תיאור:</strong> {selectedApartment?.description || "דירה למגורים"}</p>
        <p style={styles.details}><strong>סכום שכירות חודשי:</strong> {selectedApartment?.rentAmount} ₪</p>

        <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '15px 0' }} />

        <h3 style={{ color: '#c62828', marginTop: 0, fontSize: '16px' }}>סטטוס תשלום נוכחי:</h3>
        {renderStatus()}
      </div>

      <TenantElectricityStats paymentHistory={paymentHistory} />

      <button 
        style={styles.uploadButton} 
        onClick={() => {
          if (selectedApartment) {
            user.apartmentId = selectedApartment.id; 
          }
          setScreen("upload");
        }}
      >
        העלאת קריאת מונה חדשה
      </button>

      <button style={styles.secondaryBtn} onClick={() => setView("history")}>
        הצג היסטוריית תשלומים וייצוא
      </button>

      <div style={{ marginTop: "45px" }}>
        <button style={{ padding: "10px 20px", cursor: "pointer", border: "none", borderRadius: "4px", backgroundColor: "#eceff1", color: "#546e7a", fontWeight: 'bold' }} onClick={() => setScreen("login")}>
          התנתק
        </button>
      </div>
    </div>
  );
}