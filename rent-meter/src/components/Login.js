import React from 'react';

export default function Login({ setScreen, setRole }) {


    const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    // אם הוא שוכר נשלח אותו למסך השוכר, אם משכיר ל-Dashboard
    setScreen(selectedRole === "tenant" ? "tenant" : "landlord");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ברוכים הבאים ל- SmartProp-Manager </h1>
        <p style={styles.subtitle}>אנא בחר את סוג המשתמש כדי להתחיל</p>
        
        <div style={styles.buttonGroup}>
          <button 
            style={{...styles.button, backgroundColor: '#3f51b5'}} 
            onClick={() => handleLogin("tenant")}
          >
             אני שוכר
          </button>
          
          <button 
            style={{...styles.button, backgroundColor: '#3f51b5'}} 
            onClick={() => handleLogin("landlord")}
          >
             אני משכיר
          </button>
        </div>
      </div>
    </div>
  );
}

// עיצוב בסיסי ומהיר בתוך הקובץ
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    direction: 'rtl' // תמיכה בעברית
  },
  card: {
    backgroundColor: 'white',
    padding: '100px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '90%'
  },
  title: {
    fontSize: '24px',
    marginBottom: '10px',
    color: '#333'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  button: {
    padding: '15px',
    fontSize: '18px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    fontWeight: 'bold'
  }
};

