import { useState } from "react";
// ייבוא כל המסכים מהתיקייה components
import Login from "./components/Login";
import TenantDetails from "./components/TenantDetails";
import Upload from "./components/Upload";
import LandlordDashboard from "./components/LandlordDashboard";
import ApartmentForm from "./components/ApartmentForm";
import Tenant from "./components/Tenant";
import Landlord from "./components/Landlord"
import Register from "./components/Register";
import SignIn from "./components/SignIn";

function App() {
  // ניהול המצב של האפליקציה
  const [screen, setScreen] = useState("login"); // המסך המוצג (login, tenant, upload, confirmation, landlord)
  const [role, setRole] = useState(null);       // סוג המשתמש (tenant / landlord)
  const [reading, setReading] = useState(null); // מספר המונה שחולץ
  const [apartments, setApartments] = useState([]);

  // פונקציה פשוטה למסך אישור (במקום קובץ נפרד, כדי לחסוך זמן ב-MVP)
  const ConfirmationScreen = () => (
    <div style={{ textAlign: "center", marginTop: "50px", direction: "rtl", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#4CAF50" }}>הקריאה נשלחה בהצלחה! </h2>
      <div style={{ backgroundColor: "#f0f0f0", padding: "20px", borderRadius: "8px", display: "inline-block" }}>
        <p>המספר שזוהה במערכת:</p>
        <h1 style={{ margin: "0" }}>{reading}</h1>
      </div>
      <br /><br />
      <button 
        style={{ padding: '12px 24px', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
        onClick={() => setScreen("tenant")}
      >
        חזרה לתפריט הראשי
      </button>
    </div>
  );

  return (
    <div className="App">
      
      {/* 1. מסך כניסה */}
      {screen === "login" && (
        <Login setScreen={setScreen} setRole={setRole} />
      )}

      {screen === "register" && (
        <Register setScreen={setScreen} setRole={setRole} />
      )}

      {screen === "signin" && (
        <SignIn setScreen={setScreen} />
      )}


      {screen === "tenant" && (
        <Tenant setScreen={setScreen} />
      )}


      {/* 3. מסך צילום/העלאת תמונה */}
      {screen === "upload" && (
        <Upload setScreen={setScreen} setReading={setReading} />
      )}

      {/* 4. מסך אישור קבלת נתונים */}
      {screen === "confirmation" && (
        <ConfirmationScreen />
      )}


      {screen === "landlord" && (
        <Landlord />
      )}

      {screen === "addApartment" && (
        <ApartmentForm 
          setScreen={setScreen}
          setApartments={setApartments}
        />
      )}
      
    </div>
  );
}

export default App;