import { useState } from "react";
import Login from "./components/Login";
import TenantDetails from "./components/TenantDetails";
import Upload from "./components/Upload";
import LandlordDashboard from "./components/LandlordDashboard";
import ApartmentForm from "./components/ApartmentForm";
import Tenant from "./components/Tenant";
import Landlord from "./components/Landlord";
import Register from "./components/Register";
import SignIn from "./components/SignIn";
import Confirmation from "./components/Confirmation"; 

function App() {
  const [screen, setScreen] = useState("login");
  const [role, setRole] = useState(null);
  const [reading, setReading] = useState(null);
  const [user, setUser] = useState(null);

  return (
    <div className="App">

      {/* login */}
      {screen === "login" && (
        <Login setScreen={setScreen} setRole={setRole} />
      )}

      {/* register */}
      {screen === "register" && (
        <Register
          setScreen={setScreen}
          setRole={setRole}
          setUser={setUser}
        />
      )}

      {/* signin */}
      {screen === "signin" && (
        <SignIn setScreen={setScreen} setUser={setUser} />
      )}

      {/* tenant details */}
      {screen === "tenantDetails" && (
        <TenantDetails setScreen={setScreen} user={user} />
      )}

      {/* landlord dashboard */}
      {screen === "landlordDashboard" && (
        <LandlordDashboard
          user={user}
          setScreen={setScreen}
        />
      )}

      {/* tenant */}
      {screen === "tenant" && (
        <Tenant setScreen={setScreen} setUser={setUser} />
      )}

      {/* upload */}
      {screen === "upload" && (
        <Upload
          setScreen={setScreen}
          setReading={setReading}
          user={user}
        />
      )}

      {/* confirmation */}
      {screen === "confirmation" && (
        <Confirmation 
          setScreen={setScreen} 
          reading={reading} 
          user={user} 
        />
      )}

      {/* landlord */}
      {screen === "landlord" && (
        <Landlord setScreen={setScreen} setUser={setUser} />
      )}

      {/* add apartment */}
      {screen === "addApartment" && (
        <ApartmentForm
          setScreen={setScreen}
          user={user}
        />
      )}

    </div>
  );
}

export default App;