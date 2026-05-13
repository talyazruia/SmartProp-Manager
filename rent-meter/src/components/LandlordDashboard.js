import React, { useState, useEffect } from "react";
import axios from "axios";

const styles = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "sans-serif",
    direction: "rtl",
    textAlign: "right",
  },
  title: {
    color: "#333",
    borderBottom: "2px solid #2196F3",
    paddingBottom: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  th: {
    backgroundColor: "#2196F3",
    color: "white",
    padding: "12px",
    textAlign: "right",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
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
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "5px",
  },
};

export default function LandlordDashboard({ setScreen, user }) {
  const [apartments, setApartments] = useState([]);
  const [selectedApt, setSelectedApt] = useState(null);

  const [showElectricityEditor, setShowElectricityEditor] = useState(false);
  const [electricityPrice, setElectricityPrice] = useState("");
  const [previousElectricityPrice, setPreviousElectricityPrice] = useState("");

  const fetchApartments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8081/api/properties/landlord/${user?.username}`
      );

      setApartments(res.data || []);
    } catch (err) {
      console.error("שגיאה בטעינת דירות", err);
      setApartments([]);
    }
  };

  useEffect(() => {
    if (user?.username) {
      fetchApartments();
    }
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8081/api/properties/delete/${id}`
      );

      fetchApartments();

    } catch (err) {
      console.error("שגיאה במחיקה", err);
      alert("שגיאה במחיקה ❗");
    }
  };

  const fetchElectricityPrice = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8081/api/electricity/price"
      );

      const currentPrice = res.data.settingValue || 0;

      setPreviousElectricityPrice(currentPrice);
      setElectricityPrice(currentPrice);
      setShowElectricityEditor(true);

    } catch (err) {
      console.error("שגיאה בטעינת מחיר החשמל", err);
      alert("שגיאה בטעינת מחיר החשמל ❗");
    }
  };

  const updateElectricityPrice = async () => {
    try {
      await axios.put(
        "http://localhost:8081/api/electricity/price",
        {
          settingValue: Number(electricityPrice),
        }
      );

      alert("מחיר החשמל עודכן בהצלחה ✔️");
      setPreviousElectricityPrice(electricityPrice);
      setShowElectricityEditor(false);

    } catch (err) {
      console.error("שגיאה בעדכון מחיר החשמל", err);
      alert("שגיאה בעדכון ❗");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ניהול נכסים</h1>

      <div style={{ marginTop: "10px" }}>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
          onClick={() => setScreen("addApartment")}
        >
          הוספת דירה
        </button>

        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={fetchElectricityPrice}
        >
          עדכון מחיר חשמל
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>כתובת</th>
            <th style={styles.th}>מחיר</th>
            <th style={styles.th}>סטטוס</th>
            <th style={styles.th}>שוכר</th>
            <th style={styles.th}>פעולות</th>
          </tr>
        </thead>

        <tbody>
          {(apartments || []).map((apt) => (
            <tr key={apt.id}>
              <td style={styles.td}>
                {apt.address}
              </td>

              <td style={styles.td}>
                {apt.rentAmount ? `${apt.rentAmount} ₪` : "—"}
              </td>

              <td style={styles.td}>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: apt.rented
                      ? "#4CAF50"
                      : "#FF9800",
                  }}
                >
                  {apt.rented ? "מושכרת" : "פנויה"}
                </span>
              </td>

              <td style={styles.td}>
                {apt.tenant || "—"}
              </td>

              <td style={styles.td}>
                <button
                  style={{
                    ...styles.btn,
                    backgroundColor: "#2196F3",
                    color: "white",
                  }}
                  onClick={() => setSelectedApt(apt)}
                >
                  פרטים
                </button>

                <button
                  style={{
                    ...styles.btn,
                    backgroundColor: "#e53935",
                    color: "white",
                  }}
                  onClick={() => handleDelete(apt.id)}
                >
                  הסר
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedApt && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#e3f2fd",
            borderRadius: "8px",
            border: "1px solid #2196F3",
          }}
        >
          <h3>מידע נוסף</h3>

          <p>
            {selectedApt.description || "אין תיאור"}
          </p>

          <button
            onClick={() => setSelectedApt(null)}
          >
            סגור
          </button>
        </div>
      )}

      {showElectricityEditor && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#fff3e0",
            borderRadius: "8px",
            border: "1px solid #FF9800",
          }}
        >
          <h3>עדכון מחיר חשמל</h3>

          <p>
            מחיר קודם:
            <strong>
              {" "}{previousElectricityPrice} ₪
            </strong>
          </p>

          <input
            type="number"
            step="0.01"
            value={electricityPrice}
            onChange={(e) =>
              setElectricityPrice(e.target.value)
            }
            style={{
              padding: "8px",
              width: "200px",
              marginBottom: "15px",
            }}
          />

          <br />

          <button
            onClick={updateElectricityPrice}
            style={{
              marginLeft: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            שמור
          </button>

          <button
            onClick={() =>
              setShowElectricityEditor(false)
            }
            style={{
              backgroundColor: "#e53935",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            ביטול
          </button>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => setScreen("login")}
        >
          התנתק
        </button>
      </div>
    </div>
  );
}