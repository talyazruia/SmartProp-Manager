import React, { useState } from "react";
import axios from "axios";

export default function SignIn({ setScreen, setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
          placeholder="מייל"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          onFocus={(e) => e.target.style.borderColor = '#1d529d'}
          onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
        />
      </div>

      {/* עטיפת שדה הסיסמה בדיב עם מיקום יחסי */}
      <div style={styles.passwordWrapper}>
        <input
          type={showPassword ? "text" : "password"} // סוג הקלט משתנה דינמית
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.passwordInput} // שימוש בעיצוב הייעודי לשדה הסיסמה
          onFocus={(e) => e.target.style.borderColor = '#1d529d'}
          onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
        />
        <button 
          type="button" // מונע התנהגות ברירת מחדל של שליחת טופס
          onClick={() => setShowPassword(!showPassword)} 
          style={styles.eyeButton}
        >
          {showPassword ? (
            // אייקון עין עם קו חוצה
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.74-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.01-.16c0-1.66-1.34-3-3-3l-.16.01z"></path>
            </svg>
          ) : (
            // אייקון עין רגילה
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
            </svg>
          )}
        </button>
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
  
  // עיצוב ייעודי לשדה הסיסמה שכולל מרווח עבור העין בצד שמאל
  passwordInput: {
    width: '100%',
    padding: '14px 16px',
    paddingLeft: '44px', // משאיר מקום נקי לאייקון משמאל
    fontSize: '16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
  },
  // מיקום יחסי המאפשר להציב את העין בתוך השדה באופן אבסולוטי
  passwordWrapper: { 
    position: "relative", 
    display: "block",
    width: '100%',
    marginBottom: '16px'
  },
  // עיצוב כפתור העין המקצועי
  eyeButton: { 
    position: "absolute", 
    left: "14px", 
    top: "50%", 
    transform: "translateY(-50%)", 
    background: "none", 
    border: "none", 
    cursor: "pointer", 
    padding: 0, 
    color: "#718096", // הותאם לצבע הניטרלי של ה-subtitle שלכם
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  
  actionButtons: {
    marginTop: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  btnConfirm: {
    backgroundColor: '#2e7d32',
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