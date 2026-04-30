import React, { useState } from "react";

// "דאטאבייס" זמני
const tenants = [
  {
    username: "dani",
    password: "1234",
    name: "דני כהן",
    address: "רחוב הרצל 10, תל אביב",
    status: "לא שולם"
  }
];

const landlords = [
  {
    username: "owner",
    password: "1234",
    name: "יוסי לוי",
    apartments: [
      {
        id: 1,
        address: "הרצל 10",
        isRented: true,
        tenant: "דני כהן",
        extraInfo: "משלם באיחור"
      }
    ]
  }
];

export default function SignIn({ setScreen, setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    //  חיפוש שוכר
    const tenant = tenants.find(
      (t) => t.username === username && t.password === password
    );

    if (tenant) {
      setUser({ ...tenant, type: "tenant" });
      setScreen("tenantDetails");
      return;
    }

    //  חיפוש משכיר
    const landlord = landlords.find(
      (l) => l.username === username && l.password === password
    );

    if (landlord) {
      setUser({ ...landlord, type: "landlord" });
      setScreen("landlordDashboard");
      return;
    }

    //  לא נמצא
    alert("אין כזה משתמש, נא להירשם ❗");
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