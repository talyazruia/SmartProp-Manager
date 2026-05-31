import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

const LOGO_BLUE = "#1a5f9e";

const styles = {
  container: { 
    padding: "20px", 
    maxWidth: "500px", 
    margin: "40px auto", 
    fontFamily: "sans-serif", 
    direction: "rtl", 
    textAlign: "right" 
  },
  title: { 
    color: "#2c3e50", 
    borderBottom: `2px solid ${LOGO_BLUE}`, 
    paddingBottom: "10px", 
    marginBottom: "20px" 
  },
  pageContainer: { 
    padding: "30px", 
    borderRadius: "8px", 
    border: "1px solid #ddd", 
    backgroundColor: "#fff", 
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)", 
    borderTop: `4px solid ${LOGO_BLUE}` 
  },
  inputField: { 
    display: "block", 
    padding: "10px", 
    paddingLeft: "40px", 
    width: "100%", 
    marginBottom: "5px", 
    borderRadius: "4px", 
    border: "1px solid #ddd", 
    boxSizing: "border-box", 
    fontSize: "14px" 
  },
  label: { 
    display: "block", 
    marginBottom: "5px", 
    fontWeight: "bold", 
    color: "#555", 
    fontSize: "14px", 
    marginTop: "10px" 
  },
  errorText: { 
    color: "#c62828", 
    fontSize: "12px", 
    marginBottom: "10px", 
    fontWeight: "bold" 
  },
  btnSubmit: { 
    width: "100%", 
    padding: "12px", 
    backgroundColor: "#2e7d32", 
    color: "white", 
    border: "none", 
    borderRadius: "4px", 
    cursor: "pointer", 
    fontSize: "16px", 
    fontWeight: "bold", 
    marginTop: "15px", 
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
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
    fontWeight: "bold" 
  },
  passwordWrapper: { 
    position: "relative", 
    display: "block" 
  },
  eyeButton: { 
    position: "absolute", 
    left: "12px", 
    top: "50%", 
    transform: "translateY(-50%)", 
    background: "none", 
    border: "none", 
    cursor: "pointer", 
    padding: 0, 
    color: "#757575", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

const Landlord = ({ setScreen, setUser }) => {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    // 1. הסרנו את username מהערכים הראשוניים
    initialValues: { firstName: "", lastName: "", phone: "", email: "", password: "" },
    validationSchema: Yup.object({
      firstName: Yup.string().required("שדה חובה *"),
      lastName: Yup.string().required("שדה חובה *"),
      phone: Yup.string().required("שדה חובה *"),
      email: Yup.string().email("כתובת מייל לא תקינה").required("שדה חובה *"),
      password: Yup.string().matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "לפחות 8 תווים, כולל אותיות ומספרים").required("שדה חובה *"),
    }),
    onSubmit: async (values) => {
      try {
        // 2. יצירת אובייקט חדש שנשלח ל-API, המעתיק את המייל לתוך עמודת ה-username
        const payload = {
          ...values,
          username: values.email // כאן המייל נכנס לעמודה של השם משתמש בדאטאבייס
        };

        const res = await axios.post("http://localhost:8081/api/auth/register/landlord", payload);
        console.log("Saved successfully:", res.data);

        if (res.data.status === "error") {
          alert(res.data.message);
          return;
        }

        // 3. עדכון הסטייט הכללי של המשתמש המחובר עם האימייל בתור ה-username שלו
        setUser({
          username: values.email, 
          name: `${values.firstName} ${values.lastName}`,
          type: "landlord",
        });
        setScreen("landlordDashboard");
      } catch (err) { 
        alert("שגיאה בשמירה ❗"); 
      }
    },
  });

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => setScreen("login")}>⬅ חזרה למסך הבית</button>
      <div style={styles.pageContainer}>
        <h2 style={styles.title}>הרשמת משכיר חדש</h2>
        <form onSubmit={formik.handleSubmit}>
          <label style={styles.label}>שם פרטי:</label>
          <input name="firstName" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.firstName} style={styles.inputField} />
          <div style={styles.errorText}>{formik.touched.firstName && formik.errors.firstName}</div>

          <label style={styles.label}>שם משפחה:</label>
          <input name="lastName" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.lastName} style={styles.inputField} />
          <div style={styles.errorText}>{formik.touched.lastName && formik.errors.lastName}</div>

          <label style={styles.label}>מספר טלפון:</label>
          <input name="phone" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.phone} style={styles.inputField} />
          <div style={styles.errorText}>{formik.touched.phone && formik.errors.phone}</div>

          <label style={styles.label}>כתובת אימייל:</label>
          <input name="email" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email} style={styles.inputField} />
          <div style={styles.errorText}>{formik.touched.email && formik.errors.email}</div>


          <label style={styles.label}>סיסמה מאובטחת:</label>
          <div style={styles.passwordWrapper}>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              onChange={formik.handleChange} 
              onBlur={formik.handleBlur} 
              value={formik.values.password} 
              style={styles.inputField} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              style={styles.eyeButton}
            >
              {showPassword ? (
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.74-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.01-.16c0-1.66-1.34-3-3-3l-.16.01z"></path>
                </svg>
              ) : (
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                </svg>
              )}
            </button>
          </div>
          <div style={styles.errorText}>{formik.touched.password && formik.errors.password}</div>

          <button type="submit" style={styles.btnSubmit}>הרשם וכנס למערכת</button>
        </form>
      </div>
    </div>
  );
};

export default Landlord;