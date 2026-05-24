import React, { useEffect, useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

const Tenant = ({ setScreen, setUser }) => {
  const [landlords, setLandlords] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loadingApartments, setLoadingApartments] = useState(false);

  useEffect(() => {
    const fetchLandlords = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8081/api/landlords");
        setLandlords(res.data || []);
      } catch (err) {
        console.error("שגיאה בטעינת משכירים", err);
      }
    };
    fetchLandlords();
  }, []);

  const fetchApartments = async (username) => {
    if (!username) return;
    setLoadingApartments(true);
    try {
      const res = await axios.get(
        `http://127.0.0.1:8081/api/properties/landlord/${username}`
      );
      const available = (res.data || []).filter((a) => !a.rented);
      setApartments(available);
    } catch (err) {
      console.error("שגיאה בטעינת דירות", err);
      setApartments([]);
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
      username: Yup.string().required("חובה"),
      password: Yup.string().required("חובה"),
    }),

    onSubmit: async (values) => {
      try {
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
          username: values.username,
          password: values.password,
          landlordId: values.landlordId,
          apartmentId: values.apartmentId ? String(values.apartmentId) : null,
        };

        // *** התיקון: שינוי הכתובת לנתיב הרישום הנכון ב-AuthController ***
        const res = await axios.post("http://127.0.0.1:8081/api/auth/register/tenant", payload);

        if (res.data.status === "error") {
          alert(res.data.message);
          return;
        }

        try {
          await axios.put(
            `http://127.0.0.1:8081/api/properties/${values.apartmentId}/rent`,
            null,
            {
              params: {
                tenantName: `${values.firstName} ${values.lastName}`,
              },
            }
          );
        } catch (err) {
          console.warn("לא הצלחנו לעדכן דירה אבל השוכר נשמר:", err);
        }

        setUser({
          username: values.username,
          name: `${values.firstName} ${values.lastName}`,
          type: "tenant",
          apartmentId: values.apartmentId,
        });

        setScreen("tenantDetails");

      } catch (err) {
        console.error("Tenant save error:", err);
        alert("שגיאה בשמירת שוכר ❗");
      }
    },
  });

  return (
    <div style={{ maxWidth: "400px", margin: "auto", direction: "rtl" }}>
      <h2>יצירת שוכר</h2>

      <form onSubmit={formik.handleSubmit}>
        <input
          name="firstName"
          placeholder="שם"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.firstName}
        />
        <div style={{ color: "red" }}>
          {formik.touched.firstName && formik.errors.firstName}
        </div>

        <input
          name="lastName"
          placeholder="שם משפחה"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.lastName}
        />
        <div style={{ color: "red" }}>
          {formik.touched.lastName && formik.errors.lastName}
        </div>

        <input
          name="phone"
          placeholder="טלפון"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.phone}
        />
        <div style={{ color: "red" }}>
          {formik.touched.phone && formik.errors.phone}
        </div>

        <input
          name="email"
          placeholder="מייל"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />
        <div style={{ color: "red" }}>
          {formik.touched.email && formik.errors.email}
        </div>

        <select
          name="landlordId"
          value={formik.values.landlordId}
          onBlur={formik.handleBlur}
          onChange={(e) => {
            formik.setFieldValue("landlordId", e.target.value);
            formik.setFieldValue("apartmentId", "");
            fetchApartments(e.target.value);
          }}
        >
          <option value="">בחר משכיר</option>
          {landlords.map((l) => (
            <option key={l.username} value={l.username}>
              {l.firstName} {l.lastName}
            </option>
          ))}
        </select>
        <div style={{ color: "red" }}>
          {formik.touched.landlordId && formik.errors.landlordId}
        </div>

        <select
          name="apartmentId"
          value={formik.values.apartmentId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={!formik.values.landlordId || loadingApartments}
        >
          <option value="">
            {loadingApartments ? "טוען..." : "בחר דירה"}
          </option>
          {apartments.length === 0 && formik.values.landlordId && !loadingApartments ? (
            <option disabled value="">אין דירות פנויות</option>
          ) : (
            apartments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.address}
              </option>
            ))
          )}
        </select>
        <div style={{ color: "red" }}>
          {formik.touched.apartmentId && formik.errors.apartmentId}
        </div>

        <input
          name="username"
          placeholder="שם משתמש"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.username}
        />
        <div style={{ color: "red" }}>
          {formik.touched.username && formik.errors.username}
        </div>

        <input
          type="password"
          name="password"
          placeholder="סיסמה"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
        />
        <div style={{ color: "red" }}>
          {formik.touched.password && formik.errors.password}
        </div>

        <button type="submit">שמור</button>
      </form>
    </div>
  );
};

export default Tenant;