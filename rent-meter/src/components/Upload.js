import React, { useState } from 'react';
import axios from 'axios';

const styles = {
  container: { padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'center' },
  hiddenInput: { display: 'none' },
  uploadLabel: { backgroundColor: '#3f51b5', color: 'white', padding: '15px 20px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' },
  previewContainer: { marginTop: '20px', border: '2px dashed #ccc', borderRadius: '8px', padding: '10px', backgroundColor: '#fafafa' },
  previewImage: { maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' },
  actionButtons: { marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' },
  btnConfirm: { backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer' },
  btnCancel: { backgroundColor: '#757575', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer' },
  manualInput: { marginTop: '10px', padding: '10px', width: '50%', fontSize: '16px' }
};

export default function Upload({ setScreen, setReading, user, selectedApartment }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [manualReading, setManualReading] = useState("");

  const propertyIdToUse = selectedApartment?.id || user?.apartmentId || user?.propertyId;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setManualReading("");
      };
      reader.readAsDataURL(file);
    }
  };

  const finishUpload = async () => {
    if (!propertyIdToUse) {
      alert("שגיאה: לא נמצא מזהה דירה תקין.");
      return;
    }

    if (manualReading) {
      try {
        const res = await axios.get("http://localhost:8081/api/electricity/calculate", {
          params: {
            username: user.username,
            current: Number(manualReading),
            updateRate: false, // לא שומר ב-DB בשלב הניתוח
            propertyId: propertyIdToUse 
          }
        });
        setReading(res.data);
        setScreen("confirmation");
      } catch (err) {
        alert("שגיאה בשליחה ידנית: " + (err.response?.data?.message || err.message));
      }
      return;
    }

    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("username", user.username);
        formData.append("updateRate", false); // לא שומר ב-DB בשלב הניתוח
        formData.append("propertyId", propertyIdToUse); 

        const res = await axios.post("http://localhost:8081/api/electricity/calculate-from-image", formData);
        setReading(res.data);
        setScreen("confirmation");
      } catch (err) {
        alert("שגיאה בפענוח התמונה: " + (err.response?.data?.message || err.message));
      }
      return;
    }

    alert("בחרי תמונה או הזיני ערך ידני");
  };

  return (
    <div style={styles.container}>
      <h2>שלב 1: צילום המונה</h2>
      {selectedApartment && <p style={{ color: '#555' }}>דיווח עבור הכתובת: <strong>{selectedApartment.address}</strong></p>}
      
      <label htmlFor="icon-button-file" style={styles.uploadLabel}>
        {imagePreview ? "שנה תמונה" : "צלם או בחר תמונה"}
      </label>
      <input accept="image/*" style={styles.hiddenInput} id="icon-button-file" type="file" capture="environment" onChange={handleFileChange} />
      
      {imagePreview && (
        <div style={styles.previewContainer}>
          <img src={imagePreview} alt="קריאת מונה" style={styles.previewImage} />
        </div>
      )}
      
      <p style={{ marginTop: "10px" }}>או הזיני ידנית:</p>
      <input type="text" inputMode="numeric" placeholder="הכנסי קריאת מונה" value={manualReading} onChange={(e) => setManualReading(e.target.value)} style={styles.manualInput} />
      
      <div style={styles.actionButtons}>
        <button style={styles.btnCancel} onClick={() => setScreen("tenantDetails")}>ביטול</button>
        {(imagePreview || manualReading) && (
          <button style={styles.btnConfirm} onClick={finishUpload}>אישור ושליחה לניתוח</button>
        )}
      </div>
    </div>
  );
}