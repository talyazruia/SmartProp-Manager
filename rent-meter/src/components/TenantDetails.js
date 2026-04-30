
import React from 'react';

// עיצוב inline מהיר
const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
    direction: 'rtl', // תמיכה בעברית
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
    color: '#e74c3c', // אדום ל"לא שולם"
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#3f51b5', // כתום צומי
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '18px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    boxShadow: '0 4px 10px rgba(255,152,0,0.3)',
    transition: 'transform 0.1s',
  }
};

export default function TenantDetails({ setScreen, user }) {
  console.log("USER:", user);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>שלום, {user?.name} </h1>
      
      <div style={styles.card}>
        <h3>פרטי דירה:</h3>
        <p style={styles.details}>{user?.address}</p>
        
        <h3>סטטוס תשלום:</h3>
        <p style={{...styles.details, ...styles.statusBad}}>{user?.status}</p>
      </div>

      <button 
        style={styles.uploadButton}
        onClick={() => setScreen("upload")} // מעבר למסך העלאה
      >
        העלאת קריאת מונה חדשה
      </button>
    </div>
  );
}
