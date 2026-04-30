// landlord.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

const Landlord = () => {
  const [landlords, setLandlords] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loadingApartments, setLoadingApartments] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("חובה"),
      lastName: Yup.string().required("חובה"),
      phone: Yup.string().required("חובה"),
      email: Yup.string()
        .email("מייל לא תקין")
        .required("חובה"),
      username: Yup.string()
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
          "לפחות 8 תווים עם אותיות ומספרים"
        )
        .required("חובה"),
      password: Yup.string()
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
          "לפחות 8 תווים עם אותיות ומספרים"
        )
        .required("חובה"),
    }),
    onSubmit: async (values) => {
      try {
        await axios.post("http://localhost:8081/api/tenants", values);
        alert("משכיר נשמר בהצלחה ");
      } catch (err) {
        console.error(err);
        alert("שגיאה בשמירה ");
      }
    },
  });

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>יצירת משכיר</h2>

      <form onSubmit={formik.handleSubmit}>
        <input
          name="firstName"
          placeholder="שם"
          onChange={formik.handleChange}
          value={formik.values.firstName}
        />
        <div>{formik.errors.firstName}</div>

        <input
          name="lastName"
          placeholder="שם משפחה"
          onChange={formik.handleChange}
          value={formik.values.lastName}
        />
        <div>{formik.errors.lastName}</div>

        <input
          name="phone"
          placeholder="טלפון"
          onChange={formik.handleChange}
          value={formik.values.phone}
        />
        <div>{formik.errors.phone}</div>

        <input
          name="email"
          placeholder="מייל"
          onChange={formik.handleChange}
          value={formik.values.email}
        />
        <div>{formik.errors.email}</div>

        <input
          name="username"
          placeholder="שם משתמש"
          onChange={formik.handleChange}
          value={formik.values.username}
        />
        <div>{formik.errors.username}</div>

        <input
          type="password"
          name="password"
          placeholder="סיסמה"
          onChange={formik.handleChange}
          value={formik.values.password}
        />
        <div>{formik.errors.password}</div>

        <button type="submit">שמור</button>
      </form>
    </div>
  );
};

export default Landlord;