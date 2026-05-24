import React, { useState } from "react";
import axios from "axios";

export default function SignIn({ setScreen, setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8081/api/auth/login", {
        username,
        password,
      });
      if (res.data.status === "success") {
        setUser({
          username,
          name: res.data.name,
          type: res.data.role,
          apartmentId: res.data.apartmentId
        });
        setScreen(res.data.role === "tenant" ? "tenantDetails" : "landlordDashboard");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("שגיאה בהתחברות");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>התחברות למערכת</h2>
      <p style={styles.subtitle}>אנא הכניס את פרטי הגישה שלך</p>

      <div style={styles.inputGroup}>
        <input
          type="text"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          onFocus={(e) => e.target.style.borderColor = '#1d529d'}
          onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
        />
      </div>

      <div style={styles.inputGroup}>
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          onFocus={(e) => e.target.style.borderColor = '#1d529d'}
          onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
        />
      </div>

      <div style={styles.actionButtons}>
        <button onClick={login} style={styles.btnConfirm}>
          התחברות
        </button>
        <button onClick={() => setScreen("login")} style={styles.btnCancel}>
          חזרה למסך הראשי
        </button>
      </div>
    </div>
  );
}

// אובייקט העיצוב המקצועי - מותאם אישית ל-Smart-Prop
const styles = {
  container: {
    backgroundColor: '#ffffff',
    padding: '40px 32px',
    maxWidth: '420px',
    margin: '60px auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    direction: 'rtl',
    textAlign: 'center',
    borderRadius: '16px',
    // הצללה יוקרתית ומרוככת ללא קווים חותכים
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.03)',
  },
  title: {
    color: '#1a202c',
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '6px',
  },
  subtitle: {
    color: '#718096',
    fontSize: '14px',
    marginBottom: '32px',
  },
  inputGroup: {
    width: '100%',
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
  },
  actionButtons: {
    marginTop: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  btnConfirm: {
    backgroundColor: '#2e7d32', // הירוק המקצועי שמופיע בכפתור ההתחברות שלכם
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    width: '100%',
    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)',
    transition: 'background-color 0.2s',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    color: '#718096',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    textDecoration: 'underline',
  },
};