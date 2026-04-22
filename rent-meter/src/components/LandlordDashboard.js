import React, { useState } from 'react';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
    direction: 'rtl',
    textAlign: 'right',
  },
  title: {
    color: '#333',
    borderBottom: '2px solid #2196F3',
    paddingBottom: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  th: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '12px',
    textAlign: 'right',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ddd',
  },
  badge: {
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
  },
  detailsPanel: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    border: '1px solid #2196F3',
  },
  btnDetails: {
    backgroundColor: '#ff5252',
    color: 'white',
    border: 'none',
    padding: '5px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '5px',
  },
  btnDelete: {
    backgroundColor: '#ff5252',
    color: 'white',
    border: 'none',
    padding: '5px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default function LandlordDashboard({ setScreen, apartments, setApartments }) {
  

  const [selectedApt, setSelectedApt] = useState(null);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ניהול נכסים - מבט על </h1>
      
      <button
  style={{
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }}
  onClick={() => setScreen("addApartment")}
>
   הוספת דירה
</button>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>כתובת</th>
            <th style={styles.th}>סטטוס</th>
            <th style={styles.th}>שוכר</th>
            <th style={styles.th}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {apartments.map((apt) => (
            <tr key={apt.id}>
              <td style={styles.td}>{apt.address}</td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge, 
                  backgroundColor: apt.isRented ? '#4CAF50' : '#FF9800'
                }}>
                  {apt.isRented ? "מושכרת" : "פנויה"}
                </span>
              </td>
              <td style={styles.td}>{apt.tenant}</td>
              <td style={styles.td}>
                <button 
                  style={styles.btnDetails} 
                  onClick={() => setSelectedApt(apt)}
                >
                  פרטים 
                </button>
                <button 
                  style={styles.btnDelete}
                  onClick={() => setApartments(apartments.filter(a => a.id !== apt.id))}
                >
                  הסר
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* אזור פרטים נוספים שמופיע רק כשלוחצים על "פרטים" */}
      {selectedApt && (
        <div style={styles.detailsPanel}>
          <h3> מידע נוסף: {selectedApt.address}</h3>
          <p>{selectedApt.extraInfo}</p>
          <button 
            onClick={() => setSelectedApt(null)}
            style={{padding: '5px 10px', cursor: 'pointer'}}
          >
            סגור X
          </button>
        </div>
      )}

      <div style={{marginTop: '30px'}}>
        <button onClick={() => setScreen("login")}>התנתק</button>
      </div>
    </div>
  );
}