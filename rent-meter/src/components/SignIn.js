import React, { useState } from "react";

export default function SignIn({ setScreen }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    alert(`Login: ${username}`);
    setScreen("home"); // או tenant/landlord לפי backend
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

      <button onClick={login}>
        התחבר
      </button>

      <button onClick={() => setScreen("home")}>
        חזרה
      </button>
    </div>
  );
}