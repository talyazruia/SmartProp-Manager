import React, { useState } from "react";
import axios from "axios";
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
    gap: "12px",
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

export default function ApartmentForm({
  setScreen,
  setApartments,
  user,
}) {
  const [formData, setFormData] = useState({
    city: "",
    street: "",
    buildingNumber: "",
    apartmentNumber: "",
    description: "",
    price: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const res = await axios.post(
        "http://localhost:8081/api/properties/add",
        property
      );

      console.log("Property saved:", res.data);

      setScreen("landlordDashboard");

    } catch (err) {
      console.error("Error saving property:", err);

      if (err.response) {
        console.log("Server response:", err.response.data);
      }

      alert("שגיאה בשמירת דירה ❗");
    }
  };

  return (
    <div style={styles.container}>
      <h2>הוספת דירה חדשה</h2>

      <form onSubmit={handleSubmit} style={styles.form}>

        <label>עיר</label>
        <CitySearch
          value={formData.city}
          onChange={(city) =>
            setFormData((prev) => ({ ...prev, city }))
          }
        />

        <label>רחוב</label>
        <input
          style={styles.input}
          name="street"
          value={formData.street}
          onChange={handleChange}
          required
        />

        <label>מספר בניין</label>
        <input
          style={styles.input}
          type="number"
          name="buildingNumber"
          value={formData.buildingNumber}
          onChange={handleChange}
          required
        />

        <label>מספר דירה</label>
        <input
          style={styles.input}
          type="number"
          name="apartmentNumber"
          value={formData.apartmentNumber}
          onChange={handleChange}
        />

        <label>שכר דירה</label>
        <input
          style={styles.input}
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <label>תיאור הדירה</label>
        <textarea
          style={styles.textarea}
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <button type="submit" style={styles.button}>
          שמור דירה
        </button>
      </form>

      <button
        style={{ ...styles.button, marginTop: "10px" }}
        onClick={() => setScreen("landlordDashboard")}
      >
        חזרה למסך הבית
      </button>
    </div>
  );
}
