import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
    direction: 'rtl',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '10px',
  },
  details: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  statusBad: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#3f51b5',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '18px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
  }
};

export default function TenantDetails({ setScreen, user }) {
  const [apartment, setApartment] = useState(null);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/properties/all");
        const myApt = res.data.find(
          (p) => String(p.id) === String(user?.apartmentId)
        );
        setApartment(myApt);
      } catch (err) {
        console.error("שגיאה בטעינת דירה", err);
      }
    };
    if (user) fetchApartment();
  }, [user]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>שלום, {user?.name}</h1>
      <div style={styles.card}>
        <h3>פרטי דירה:</h3>
        <p style={styles.details}>{apartment?.address || "טוען..."}</p>
        <h3>סטטוס תשלום:</h3>
        <p style={{...styles.details, ...styles.statusBad}}>לא שולם</p>
      </div>
      <button style={styles.uploadButton} onClick={() => setScreen("upload")}>
        העלאת קריאת מונה חדשה
      </button>
    </div>
  );
}