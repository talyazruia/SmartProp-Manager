import React, { useState } from "react";
import axios from "axios";
import CitySearch from "../services-import-city";

const LOGO_BLUE = "#1a5f9e";
const LOGO_GOLD = "#f2b819";

const styles = {
  container: {
    padding: "15px 20px",
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: "sans-serif",
    direction: "rtl",
    textAlign: "right",
    height: "80vh",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    color: "#2c3e50",
    borderBottom: `2px solid ${LOGO_BLUE}`,
    paddingBottom: "6px",
    marginBottom: "12px",
    marginTop: "0px",
    fontSize: "24px",
  },
  pageContainer: {
    padding: "15px 25px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    borderTop: `4px solid ${LOGO_BLUE}`,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justify: "flex-start",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxWidth: "450px",
    width: "100%",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  label: {
    fontWeight: "bold",
    fontSize: "13px",
    color: "#444",
  },
  input: {
    width: "100%",
    padding: "7px 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "7px 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    minHeight: "50px",
    maxHeight: "65px",
    resize: "none",
    boxSizing: "border-box",
  },
  btn: {
    border: "none",
    padding: "9px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  backBtn: {
    backgroundColor: "#546e7a",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "12px",
    fontSize: "13px",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
};

export default function ApartmentForm({ setScreen, setApartments, user }) {
  const [formData, setFormData] = useState({
    city: "", street: "", buildingNumber: "", apartmentNumber: "", description: "", price: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const property = {
      address: `${formData.street} ${formData.buildingNumber}, דירה ${formData.apartmentNumber}, ${formData.city}`,
      description: formData.description,
      rentAmount: Number(formData.price),
      landlordUsername: user?.username,
    };

    try {
      const res = await axios.post("http://localhost:8081/api/properties/add", property);
      console.log("Property saved:", res.data);
      alert("הדירה נשמרה בהצלחה! ✔️");
      setScreen("landlordDashboard");
    } catch (err) {
      console.error("Error saving property:", err);
      alert("שגיאה בשמירת דירה ❗");
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => setScreen("landlordDashboard")}>⬅ חזרה לניהול דירות</button>
      <h1 style={styles.title}>הוספת דירה חדשה</h1>
      <div style={styles.pageContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>עיר</label>
            <CitySearch value={formData.city} onChange={(city) => setFormData((prev) => ({ ...prev, city }))} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>רחוב</label>
            <input style={styles.input} name="street" value={formData.street} onChange={handleChange} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>מספר בניין</label>
            <input style={styles.input} type="number" name="buildingNumber" value={formData.buildingNumber} onChange={handleChange} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>מספר דירה</label>
            <input style={styles.input} type="number" name="apartmentNumber" value={formData.apartmentNumber} onChange={handleChange} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>שכר דירה (₪)</label>
            <input style={styles.input} type="number" name="price" value={formData.price} onChange={handleChange} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>תיאור הדירה</label>
            <textarea style={styles.textarea} name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            {/* ירוק מותג חיובי לשמירה */}
            <button type="submit" style={{ ...styles.btn, backgroundColor: "#2e7d32", color: "white" }}>שמור דירה</button>
            {/* אדום מאופק לביטול */}
            <button type="button" style={{ ...styles.btn, backgroundColor: "#c62828", color: "white" }} onClick={() => setScreen("landlordDashboard")}>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
}