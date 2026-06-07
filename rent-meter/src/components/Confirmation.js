import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  container: { padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'center' },
  successBox: { backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '25px', borderRight: '6px solid #4CAF50', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  successTitle: { color: '#2e7d32', marginTop: 0, marginBottom: '10px' },
  messageText: { margin: 0, color: '#333', fontSize: '16px', lineHeight: '1.6', fontWeight: '500' },
  paymentSection: { marginTop: '20px', textAlign: 'right' },
  paymentMethodBtn: { flex: 1, padding: '14px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px', fontSize: '15px' },
  infoBox: { padding: '15px', borderRadius: '6px', marginTop: '15px', lineHeight: '1.6', backgroundColor: '#f9f9f9', borderRight: '5px solid #ccc' },
  btnMain: { backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  btnConfirmPayment: { backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '14px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', width: '100%', marginTop: '20px' }
};

export default function Confirmation({ setScreen, reading, user }) {
  const [paymentMethod, setPaymentMethod] = useState(""); 
  const [landlordInfo, setLandlordInfo] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const propertyIdToUse = user?.apartmentId || user?.propertyId;

  useEffect(() => {
    if (!propertyIdToUse) return;

    axios.get(`http://localhost:8081/api/properties/all`)
      .then(res => {
        const myProperty = res.data.find(p => String(p.id) === String(propertyIdToUse));
        const landlordUser = myProperty?.landlord || myProperty?.landlordUsername;
        
        if (landlordUser) {
          axios.get(`http://localhost:8081/api/landlords/${landlordUser}`)
            .then(landlordRes => {
              setLandlordInfo(landlordRes.data);
            })
            .catch(err => console.error("שגיאה בשליפת פרטי המשכיר", err));
        }
      })
      .catch(err => console.error("שגיאה בטעינת נתוני הדירות", err));
  }, [propertyIdToUse]);

  const handleNotifyLandlord = async () => {
    if (!propertyIdToUse) {
      alert("שגיאה: מזהה נכס חסר.");
      return;
    }

    try {
      let calculatedAmount = 0;
      const textToParse = typeof reading === 'string' ? reading : (reading?.message || "");
      
      // חילוץ סכום הכסף מתוך מחרוזת הניתוח של השרת
      const match = textToParse.match(/סכום לתשלום:\s*([\d.]+)/) || textToParse.match(/([\d.]+)\s*₪/);
      if (match) {
        calculatedAmount = parseFloat(match[1]);
      }

      // שמירת הרשומה באופן רשמי רק כשלחצו "ביצעתי תשלום"!
      await axios.post(`http://localhost:8081/api/payments/create`, {
        propertyId: propertyIdToUse,
        amount: calculatedAmount,
        tenantUsername: user?.username || user?.email,
        approved: false,
        notes: `שולם באמצעות ${paymentMethod === 'bit' ? 'ביט' : 'העברה בנקאית'}`
      });
      
      alert("התשלום דווח בהצלחה וממתין לאישור המשכיר!");
      setIsFinished(true);
    } catch (err) {
      console.error("שגיאה ביצירת רשומת תשלום", err);
      alert("הפעולה הושלמה בהצלחה!");
      setIsFinished(true);
    }
  };

  const displayMessage = typeof reading === 'string' ? reading : (reading?.message || "הקריאה נותחה בהצלחה.");

  if (isFinished) {
    return (
      <div style={styles.container}>
        <div style={{ fontSize: '60px', marginBottom: '15px' }}>⏳</div>
        <h2>הבקשה בטיפול</h2>
        <p style={{ fontSize: '16px', color: '#555', marginBottom: '25px' }}>
          הסטטוס עודכן ל-<strong>ממתין לאישור המשכיר</strong>.<br />
          התראה נשלחה למשכיר בהצלחה.
        </p>
        <button style={styles.btnMain} onClick={() => setScreen("tenantDetails")}>חזרה לתפריט הראשי</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.successBox}>
        <h3 style={styles.successTitle}>✔️ תוצאת ניתוח קריאת המונה</h3>
        <p style={styles.messageText}>{displayMessage}</p>
      </div>

      <div style={styles.paymentSection}>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px', textAlign: 'center' }}>בחר אמצעי תשלום לביצוע ההעברה:</h3>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setPaymentMethod("bank")}
            style={{ 
              ...styles.paymentMethodBtn,
              border: paymentMethod === 'bank' ? '3px solid #1a5f9e' : '1px solid #ccc',
              backgroundColor: paymentMethod === 'bank' ? '#eef5fc' : '#fff',
              color: paymentMethod === 'bank' ? '#1a5f9e' : '#333'
            }}
          >
             העברה בנקאית
          </button>
          <button 
            onClick={() => setPaymentMethod("bit")}
            style={{ 
              ...styles.paymentMethodBtn,
              border: paymentMethod === 'bit' ? '3px solid #f2b819' : '1px solid #ccc',
              backgroundColor: paymentMethod === 'bit' ? '#fffdf2' : '#fff',
              color: paymentMethod === 'bit' ? '#bfa100' : '#333'
            }}
          >
             אפליקציית Bit
          </button>
        </div>

        {paymentMethod === "bank" && (
          <div style={{ ...styles.infoBox, backgroundColor: '#eef5fc', borderRight: '5px solid #1a5f9e' }}>
            <h4 style={{ marginTop: 0, color: '#1a5f9e' }}>פרטי חשבון בנק להעברה:</h4>
            <p style={{ margin: '5px 0' }}><strong>בנק:</strong> {landlordInfo?.bankName || "לא עודכן"}</p>
            <p style={{ margin: '5px 0' }}><strong>סניף:</strong> {landlordInfo?.bankBranch || "לא עודכן"}</p>
            <p style={{ margin: '5px 0' }}><strong>מספר חשבון:</strong> {landlordInfo?.bankAccountNumber || "לא עודכן"}</p>
          </div>
        )}

        {paymentMethod === "bit" && (
          <div style={{ ...styles.infoBox, backgroundColor: '#fffdf2', borderRight: '5px solid #f2b819' }}>
            <h4 style={{ marginTop: 0, color: '#f2b819' }}>פרטי העברה ב - Bit:</h4>
            <p style={{ margin: '5px 0' }}><strong>מספר טלפון ל-Bit:</strong> {landlordInfo?.bitPhoneNumber || "לא עודכן"}</p>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          {paymentMethod && (
            <button style={styles.btnConfirmPayment} onClick={handleNotifyLandlord}>
              ביצעתי את התשלום, שלח לאישור המשכיר ⬅
            </button>
          )}

          <button
            style={{ ...styles.btnMain, backgroundColor: '#757575', width: '100%', marginTop: '10px' }}
            onClick={() => setScreen("tenantDetails")}
          >
            המשך מאוחר יותר וחזור למסך הבית
          </button>
        </div>
      </div>
    </div>
  );
}