import React, { useState } from 'react';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
    direction: 'rtl',
    textAlign: 'center',
  },
  title: {
    fontSize: '22px',
    marginBottom: '20px',
  },
  // ה"טריק": הכפתור האמיתי מוסתר
  hiddenInput: {
    display: 'none',
  },
  // עיצוב הכפתור המדומה
  uploadLabel: {
    backgroundColor: '#3f51b5', // כחול
    color: 'white',
    padding: '15px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  previewContainer: {
    marginTop: '20px',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '10px',
    backgroundColor: '#fafafa',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
  },
  actionButtons: {
    marginTop: '30px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  btnConfirm: {
    backgroundColor: '#4CAF50', // ירוק
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  btnCancel: {
    backgroundColor: '#757575', // אפור
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
  },

 // שדה להזנה ידנית
manualInput: {
    marginTop: '10px',
    padding: '10px',
    width: '50%',
    fontSize: '16px',
  }
};

export default function Upload({ setScreen, setReading }) {
  const [imagePreview, setImagePreview] = useState(null);
  // state להזנה ידנית
  const [manualReading, setManualReading] = useState("");

  // פונקציה שמופעלת כשהמשתמש בוחר קובץ
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // יצירת URL מקומי לצורך תצוגה מקדימה בלבד
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // אם בחר תמונה → ננקה הזנה ידנית (שלא יתנגש)
      setManualReading("");
      };
      
      reader.readAsDataURL(file);
    }
  };

  // פונקציה שמסמלת את סיום ההעלאה (זיוף API)
  const finishUpload = () => {
    // אם יש הזנה ידנית → עדיפות לה
    if (manualReading) {
      setReading(Number(manualReading));
      setScreen("confirmation");
      return;
    }

    // אחרת → תמונה
    if (imagePreview) {
      const fakeReading = 500;
      setReading(fakeReading);
      setScreen("confirmation");
      return;
    }

     // אם לא נבחר כלום
    alert("בחרו תמונה או הזינו ערך ידני");

  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>שלב 1: צילום המונה </h2>
      <p>וודאי שהמספרים במונה ברורים וקריאים.</p>

      {/* הכפתור המדומה (label) */}
      <label htmlFor="icon-button-file" style={styles.uploadLabel}>
         {imagePreview ? "שנה תמונה" : "צלם או בחר תמונה"}
      </label>

      {/* הכפתור האמיתי, הנסתר */}
      {/* בנייד, capture="environment" ינסה לפתוח ישירות את המצלמה האחורית */}
      <input 
        accept="image/*" 
        style={styles.hiddenInput} 
        id="icon-button-file" 
        type="file" 
        capture="environment"
        onChange={handleFileChange} 
      />

      {/* תצוגה מקדימה של התמונה שנבחרה */}
      {imagePreview && (
        <div style={styles.previewContainer}>
          <h4>תצוגה מקדימה:</h4>
          <img src={imagePreview} alt="קריאת מונה" style={styles.previewImage} />
        </div>
      )}
      
      <p style={{ marginTop: "10px" }}>או הזיני ידנית:</p>

      <input
        type="text"
        inputMode="numeric"
        placeholder="הכנסי קריאת מונה"
        value={manualReading}
        onChange={(e) => {
          setManualReading(e.target.value);

          //  אם מקלידים → ננקה תמונה
          setImagePreview(null);
        }}
        style={styles.manualInput}
      />


      {/* כפתורי פעולה */}
      <div style={styles.actionButtons}>
        <button style={styles.btnCancel} onClick={() => setScreen("tenantDetails")}>ביטול</button>
        {(imagePreview || manualReading) && (
          <button style={styles.btnConfirm} onClick={finishUpload}>
            אישור ושליחה לניתוח
          </button>
        )}
      </div>
    </div>
  );
}