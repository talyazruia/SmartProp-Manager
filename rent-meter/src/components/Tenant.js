import React from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

const LOGO_BLUE = "#1a5f9e";

const styles = {
  container: { padding: "20px", maxWidth: "500px", margin: "40px auto", fontFamily: "sans-serif", direction: "rtl", textAlign: "right" },
  title: { color: "#2c3e50", borderBottom: `2px solid ${LOGO_BLUE}`, paddingBottom: "10px", marginBottom: "20px" },
  pageContainer: { padding: "30px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderTop: `4px solid ${LOGO_BLUE}` },
  inputField: { display: "block", padding: "10px", width: "100%", marginBottom: "5px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "14px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold", color: "#555", fontSize: "14px", marginTop: "10px" },
  errorText: { color: "#c62828", fontSize: "12px", marginBottom: "10px", fontWeight: "bold" },
  btnSubmit: { width: "100%", padding: "12px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  backBtn: { backgroundColor: "#546e7a", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "20px", fontSize: "14px", fontWeight: "bold" }
};

const Tenant = ({ setScreen, setUser }) => {
  const formik = useFormik({
    initialValues: { firstName: "", lastName: "", phone: "", email: "", username: "", password: "" },
    validationSchema: Yup.object({
      firstName: Yup.string().required("שדה חובה *"),
      lastName: Yup.string().required("שדה חובה *"),
      phone: Yup.string().required("שדה חובה *"),
      email: Yup.string().email("כתובת מייל לא תקינה").required("שדה חובה *"),
      username: Yup.string().required("שדה חובה *"),
      password: Yup.string().required("שדה חובה *"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = { ...values, landlordId: null, apartmentId: null };
        await axios.post("http://localhost:8081/api/tenants", payload);
        setUser({ username: values.username, name: `${values.firstName} ${values.lastName}`, type: "tenant", apartmentId: null });
        setScreen("tenantDetails");
      } catch (err) { alert("שגיאה בשמירת שוכר ❗"); }
    }
  });

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => setScreen("login")}>⬅ חזרה למסך הבית</button>
      <div style={styles.pageContainer}>
        <h2 style={styles.title}>הרשמת שוכר חדש</h2>
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

          <label style={styles.label}>שם משתמש (עבור התחברות):</label>
          <input name="username" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.username} style={styles.inputField} />
          <div style={styles.errorText}>{formik.touched.username && formik.errors.username}</div>

          <label style={styles.label}>סיסמה:</label>
          <input type="password" name="password" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.password} style={styles.inputField} />
          <div style={styles.errorText}>{formik.touched.password && formik.errors.password}</div>

          <button type="submit" style={styles.btnSubmit}>הרשם ושמור</button>
        </form>
      </div>
    </div>
  );
};

export default Tenant;