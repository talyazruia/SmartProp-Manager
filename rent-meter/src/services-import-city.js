import { useState, useEffect } from "react";
import axios from "axios";
import { TextField, List, ListItem, ListItemText } from "@mui/material";

const CitySearch = ({ value, onChange }) => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [query, setQuery] = useState(value || "");
 

  useEffect(() => {
  setQuery(value || ""); // מתעדכן בכל פעם ש-value משתנה
}, [value]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get("https://data.gov.il/api/action/datastore_search", {
          params: {
            resource_id: "b7cf8f14-64a2-4b33-8d4b-edb286fdbd37",
            limit: 1500,
          },
        });

        console.log("Fetched Data:", response.data.result.records); // debug
        const israelCities = response.data.result.records.map((item) => item["שם_ישוב"]);
        setCities(israelCities);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      setFilteredCities(
        cities.filter((city) => city.includes(query)).slice(0, 10)
      );
    } else {
      setFilteredCities([]);
    }
  }, [query, cities]);

  // פונקציה לבחירת עיר
 const handleCitySelect = (city) => {
  setQuery(city);
  setFilteredCities([]);
  if (onChange) {
    onChange(city); // שליחה לקומפוננטת האב
  }
};

  return (
    <div style={{ position: 'relative' }}>
      <input
        type = "text"
        value={query}
onChange={(e) => {
  setQuery(e.target.value); // ניהול פנימי בלבד
  setFilteredCities(       // הצגת הצעות תוך כדי הקלדה
    cities.filter((city) => city.includes(e.target.value)).slice(0, 10)
  );
}}

        style={{ width: '95%', padding: '10px', border: '1px solid #ccc' }}
      />
      
      {/* הצגת רשימת הערים אם יש הצעות */}
      {filteredCities.length > 0 && query !== value && (
        <List style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {filteredCities.map((city, index) => (
            <ListItem key={index} button onClick={() => handleCitySelect(city)}>
              <ListItemText primary={city} />
            </ListItem>
          ))}
        </List>
      )}

      
    </div>
  );
};

export default CitySearch;
