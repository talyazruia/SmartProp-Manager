import React, { useEffect, useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

const Tenant = ({ setScreen, setUser }) => {
  const [landlords, setLandlords] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loadingApartments, setLoadingApartments] = useState(false);

  useEffect(() => {
    fetchLandlords();
  }, []);

  const fetchLandlords = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/landlords");
      setLandlords(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת משכירים", err);
    }
  };

  const fetchApartments = async (landlordId) => {
    if (!landlordId) return;
    setLoadingApartments(true);
    try {
      const res = await axios.get(`http://localhost:8081/api/apartments?landlordId=${landlordId}`);
      setApartments(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת דירות", err);
    } finally {
      setLoadingApartments(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      landlordId: "",
      apartmentId: "",
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("חובה"),
      lastName: Yup.string().required("חובה"),
      phone: Yup.string().required("חובה"),
      email: Yup.string().email("מייל לא תקין").required("חובה"),
      landlordId: Yup.string().required("בחר משכיר"),
      apartmentId: Yup.string().required("בחר דירה"),
      username: Yup.string()
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "לפחות 8 תווים עם אותיות ומספרים")
        .required("חובה"),
      password: Yup.string()
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "לפחות 8 תווים עם אותיות ומספרים")
        .required("חובה"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios.post("http://localhost:8081/api/tenants", values);
        setUser({
          username: values.username,
          name: `${values.firstName} ${values.lastName}`,
          type: "tenant",
          apartmentId: values.apartmentId,
        });
        setScreen("tenantDetails");
      } catch (err) {
        console.error(err);
        alert("שגיאה בשמירה ❗");
      }
    },
  });

  return (
    <div style={{ maxWidth: "400px", margin: "auto", direction: "rtl" }}>
      <h2>יצירת שוכר</h2>
      <form onSubmit={formik.handleSubmit}>
        <input name="firstName" placeholder="שם" onChange={formik.handleChange} value={formik.values.firstName} />
        <div style={{ color: "red" }}>{formik.errors.firstName}</div>

        <input name="lastName" placeholder="שם משפחה" onChange={formik.handleChange} value={formik.values.lastName} />
        <div style={{ color: "red" }}>{formik.errors.lastName}</div>

        <input name="phone" placeholder="טלפון" onChange={formik.handleChange} value={formik.values.phone} />
        <div style={{ color: "red" }}>{formik.errors.phone}</div>

        <input name="email" placeholder="מייל" onChange={formik.handleChange} value={formik.values.email} />
        <div style={{ color: "red" }}>{formik.errors.email}</div>

        <select
          name="landlordId"
          value={formik.values.landlordId}
          onChange={(e) => {
            formik.handleChange(e);
            fetchApartments(e.target.value);
          }}
        >
          <option value="">בחר משכיר</option>
          {landlords.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <div style={{ color: "red" }}>{formik.errors.landlordId}</div>

        <select
          name="apartmentId"
          value={formik.values.apartmentId}
          onChange={formik.handleChange}
          disabled={!formik.values.landlordId || loadingApartments}
        >
          <option value="">{loadingApartments ? "טוען..." : "בחר דירה"}</option>
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>{a.address}</option>
          ))}
        </select>
        <div style={{ color: "red" }}>{formik.errors.apartmentId}</div>

        <input name="username" placeholder="שם משתמש" onChange={formik.handleChange} value={formik.values.username} />
        <div style={{ color: "red" }}>{formik.errors.username}</div>

        <input type="password" name="password" placeholder="סיסמה" onChange={formik.handleChange} value={formik.values.password} />
        <div style={{ color: "red" }}>{formik.errors.password}</div>

        <button type="submit">שמור</button>
      </form>
    </div>
  );
};

export default Tenant;