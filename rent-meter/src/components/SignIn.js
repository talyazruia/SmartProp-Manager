import React, { useState } from "react";
import axios from "axios";

export default function SignIn({ setScreen, setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:8081/api/auth/login", {
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
    <div style={{ textAlign: "center", direction: "rtl" }}>
      <h2>התחברות</h2>
      <input
        placeholder="שם משתמש"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="סיסמה"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={login}>התחבר</button>
      <button onClick={() => setScreen("login")}>חזרה</button>
    </div>
  );
}