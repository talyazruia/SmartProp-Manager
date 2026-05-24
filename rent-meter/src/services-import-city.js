import { useState, useEffect } from "react";
import axios from "axios";

const CitySearch = ({ value, onChange }) => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [query, setQuery] = useState(value || "");

  useEffect(() => {
    setQuery(value || "");
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

  const handleCitySelect = (city) => {
    setQuery(city);
    setFilteredCities([]);
    if (onChange) {
      onChange(city);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setFilteredCities(
            cities.filter((city) => city.includes(e.target.value)).slice(0, 10)
          );
        }}
        style={{ width: "95%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "14px" }}
      />

      {filteredCities.length > 0 && query !== value && (
        <ul style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: "white",
          border: "1px solid #ccc",
          maxHeight: "200px",
          overflowY: "auto",
          margin: 0,
          padding: 0,
          listStyle: "none",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          {filteredCities.map((city, index) => (
            <li
              key={index}
              onClick={() => handleCitySelect(city)}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                direction: "rtl",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CitySearch;
