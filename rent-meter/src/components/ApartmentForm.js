import React, { useState } from "react";
import CitySearch from "../services-import-city";

const styles = {
  container: {
    maxWidth: "450px",
    margin: "50px auto",
    padding: "20px",
    fontFamily: "sans-serif",
    direction: "rtl",
    textAlign: "right",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxSizing: "border-box",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px", // זה מה שמייצר את הרווחים בין כל השדות
    
  },

  title: {
    marginBottom: "20px",
    color: "#333",
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    minHeight: "80px",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#3f51b5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default function ApartmentForm({ setScreen, setApartments }) {
  const [formData, setFormData] = useState({
    city: "",
    street: "",
    buildingNumber: "",
    apartmentNumber: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newApartment = {
      id: Date.now(),
      address: `${formData.street} ${formData.buildingNumber}, דירה ${formData.apartmentNumber}, ${formData.city}`,
      tenant: "—",
      isRented: false,
      extraInfo: formData.description,
    };

    setApartments((prev) => [...prev, newApartment]);

    setScreen("landlord");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>הוספת דירה חדשה</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={{ position: "relative", zIndex: 100, width: "100%" }}>
        <CitySearch
          value={formData.city}
          onChange={(city) =>
            setFormData((prev) => ({ ...prev, city }))
          }
        />
       </div>

        <input
          style={styles.input}
          type="text"
          name="street"
          placeholder="רחוב"
          value={formData.street}
          onChange={handleChange}
          required
        />

        <input
          style={styles.input}
          type="number"
          name="buildingNumber"
          placeholder="מספר בניין"
          value={formData.buildingNumber}
          onChange={handleChange}
          required
        />

        <input
          style={styles.input}
          type="number"
          name="apartmentNumber"
          placeholder="מספר דירה"
          value={formData.apartmentNumber}
          onChange={handleChange}
        />

        <textarea
          style={styles.textarea}
          name="description"
          placeholder="תיאור הדירה"
          value={formData.description}
          onChange={handleChange}
        />

        <button type="submit" style={styles.button}>
          שמור דירה
        </button>
      </form>

      <button
        style={{ ...styles.button, marginTop: "10px" }}
        onClick={() => setScreen("landlord")}
      >
        חזרה למסך הבית
      </button>
    </div>
  );
}