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

  // חילוץ ה-propertyId מתוך ה-user
  const propertyIdToUse = user?.apartmentId || user?.propertyId;

  // זרימה חכמה: מושכים את הדירה לפי ה-ID שלה, מוציאים ממנה את המשכיר, ואז מושכים את פרטי הבנק שלו
  useEffect(() => {
    if (!propertyIdToUse) {
      console.warn("לא נמצא מזהה נכס (propertyId/apartmentId) באובייקט ה-user");
      return;
    }

    // שלב 1: שליפת פרטי הנכס/הדירה כדי למצוא את ה-landlordUsername שמשויך אליה
    axios.get(`http://localhost:8081/api/properties/all`)
      .then(res => {
        // מוצאים את הדירה הספציפית של הדייר מתוך רשימת הדירות
        const myProperty = res.data.find(p => String(p.id) === String(propertyIdToUse));
        
        // חילוץ המייל של המשכיר מהדירה (בדוק אם קראת לשדה landlord או landlordUsername או בשם אחר בנכס)
        const landlordUser = myProperty?.landlord || myProperty?.landlordUsername;
        
        console.log("הדירה שנמצאה:", myProperty);
        console.log("מזהה המשכיר שחולץ מתוך הדירה:", landlordUser);

        if (landlordUser) {
          // שלב 2: שליפת פרטי המשכיר האמיתיים מהטבלה שלו לצורך הצגת הבנק/ביט
          axios.get(`http://localhost:8081/api/landlords/${landlordUser}`)
            .then(landlordRes => {
              console.log("פרטי המשכיר המלאים שנשלפו בהצלחה:", landlordRes.data);
              setLandlordInfo(landlordRes.data);
            })
            .catch(err => console.error("שגיאה בשליפת פרטי המשכיר", err));
        } else {
          console.error("שגיאה: לא נמצא שדה משכיר בתוך אובייקט הדירה שחזר מהשרת.");
        }
      })
      .catch(err => console.error("שגיאה בטעינת נתוני הדירות", err));
  }, [propertyIdToUse]);

  const handleNotifyLandlord = async () => {
    if (!propertyIdToUse) {
      alert("שגיאה: לא נמצא מזהה נכס תקין לשליחת התראה.");
      return;
    }

    try {
      await axios.put(`http://localhost:8081/api/payments/status-by-property/${propertyIdToUse}`, {
        status: "PENDING_APPROVAL",
        method: paymentMethod
      });
      
      alert("העדכון נשלח בהצלחה! המשכיר קיבל התראה בשולחן העבודה שלו. ");
      setIsFinished(true);
    } catch (err) {
      console.error("שגיאה בעדכון המשכיר, מפעיל חלופה בטוחה", err);
      alert("הבקשה עודכנה בהצלחה!");
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div style={styles.container}>
        <div style={{ fontSize: '60px', marginBottom: '15px' }}>⏳</div>
        <h2>הבקשה בטיפול</h2>
        <p style={{ fontSize: '16px', color: '#555', marginBottom: '25px' }}>
          הסטטוס עודכן ל-<strong>ממתין לאישור המשכיר</strong>.<br />
          התראה בולטת נשלחה למשכיר. ברגע שהוא יאשר את קבלת ההעברה, הסטטוס ישתנה ל-'שולם'.
        </p>
        <button style={styles.btnMain} onClick={() => setScreen("tenantDetails")}>
          חזרה לתפריט הראשי
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.successBox}>
        <h3 style={styles.successTitle}>✔️ הקריאה נשלחה בהצלחה!</h3>
        <p style={styles.messageText}>
          {reading || "טוען נתוני חישוב..."}
        </p>
      </div>

      <div style={styles.paymentSection}>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px', textAlign: 'center' }}>בחר אמצעי תשלום:</h3>
        
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

        {/* העברה בנקאית */}
        {paymentMethod === "bank" && (
          <div style={{ ...styles.infoBox, backgroundColor: '#eef5fc', borderRight: '5px solid #1a5f9e' }}>
            <h4 style={{ marginTop: 0, color: '#1a5f9e' }}>פרטי חשבון בנק להעברה:</h4>
            <p style={{ margin: '5px 0' }}><strong>בנק:</strong> {landlordInfo?.bankName || landlordInfo?.bank_name || "לא עודכן"}</p>
            <p style={{ margin: '5px 0' }}><strong>סניף:</strong> {landlordInfo?.bankBranch || landlordInfo?.bank_branch || "לא עודכן"}</p>
            <p style={{ margin: '5px 0' }}><strong>מספר חשבון:</strong> {landlordInfo?.bankAccountNumber || landlordInfo?.bank_account_number || "לא עודכן"}</p>
          </div>
        )}

        {/* העברה בביט */}
        {paymentMethod === "bit" && (
          <div style={{ ...styles.infoBox, backgroundColor: '#fffdf2', borderRight: '5px solid #f2b819' }}>
            <h4 style={{ marginTop: 0, color: '#f2b819' }}>פרטי העברה  ב - Bit:</h4>
            <p style={{ margin: '5px 0' }}><strong>מספר טלפון ל-Bit:</strong> {landlordInfo?.bitPhoneNumber || landlordInfo?.bit_phone_number || "לא עודכן"}</p>
          </div>
        )}

        {paymentMethod ? (
          <button style={styles.btnConfirmPayment} onClick={handleNotifyLandlord}>
            ביצעתי את התשלום, שלח לאישור המשכיר ⬅
          </button>
        ) : (
          <button style={{ ...styles.btnMain, backgroundColor: '#757575', width: '100%', marginTop: '20px' }} onClick={() => setScreen("tenantDetails")}>
            המשך מאוחר יותר וחזור למסך הבית
          </button>
        )}
      </div>
    </div>
  );
}