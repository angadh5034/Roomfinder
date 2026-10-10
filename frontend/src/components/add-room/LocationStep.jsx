import React, { useState } from "react";

const MAHARASHTRA_CITIES = [
  "Ahmednagar","Akola","Akot","Alibag","Ambajogai","Ambernath","Amravati",
  "Arvi","Ashti","Aurangabad","Ausa","Badlapur","Ballarpur","Baramati",
  "Barshi","Basmath","Beed","Bhandara","Bhor","Bhiwandi","Bhusawal",
  "Bid","Buldhana","Chalisgaon","Chamorshi","Chandrapur","Chiplun",
  "Dahanu","Daund","Deglur","Deoli","Desaiganj","Devgad","Dhule",
  "Digras","Dombivli","Erandol","Gadchiroli","Georai","Ghatanji",
  "Gondiya","Hadapsar","Hinganghat","Hingoli","Ichalkaranji","Igatpuri",
  "Jalgaon","Jalna","Jath","Junnar","Kagal","Kalyan","Kandhar",
  "Kannad","Karad","Karjat","Karmala","Khed","Khopoli","Kinwat",
  "Kolhapur","Kopargaon","Koregaon","Kudal","Kuhi","Kurduwadi",
  "Latur","Lonavala","Mahabaleshwar","Mahad","Malegaon","Malvan",
  "Mangaon","Manmad","Manwath","Mira-Bhayandar","Miraj","Morshi",
  "Mumbai","Murbad","Murtijapur","Nagpur","Naigaon","Nanded",
  "Nandurbar","Nashik","Navi Mumbai","Nilanga","Omerga","Osmanabad",
  "Pachora","Palghar","Pandharpur","Panvel","Parli","Parbhani",
  "Pathardi","Pathri","Patoda","Patur","Peint","Pen","Phulambri","Pimpri-Chinchwad",
  "Pune","Pusad","Rahuri","Raigad","Rajura","Ramtek","Ratnagiri",
  "Raver","Roha","Sakoli","Sangamner","Sangli","Satara","Sawantwadi",
  "Selu","Shahada","Shahpur","Shegaon","Shirdi","Shrirampur","Sillod",
  "Sindhudurg","Sindewahi","Sinnar","Solapur","Tasgaon","Thane",
  "Tirora","Trimbakeshwar","Tuljapur","Tumsar","Udgir","Ulhasnagar",
  "Umred","Uran","Vasai-Virar","Velhe","Vengurla","Vikramgad",
  "Wada","Wai","Walgaon","Wardha","Warora","Washim","Wani","Yavatmal","Yeola",
].sort();

function LocationStep({ formData, setFormData, errors }) {
  const [citySearch, setCitySearch] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const [manualCity, setManualCity] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="step-container">
      <h3 className="step-heading">Step 2: Location</h3>
      <p className="step-desc">Specify the geographic details of your listing</p>
      
      <div className="privacy-banner">
        <span>🔒</span> For privacy, the public listing shows only the locality and city, rather than exposing the complete street address immediately.
      </div>

      <div className="form-group">
        <label className="field-label">City *</label>
        {!manualCity ? (
          <div className="city-dropdown-wrap">
            <div
              className={`city-select-box ${errors.city ? "input-error" : ""} ${dropOpen ? "open" : ""}`}
              onClick={() => setDropOpen(!dropOpen)}
            >
              <span className={formData.city ? "city-selected-text" : "city-placeholder"}>
                {formData.city || "Select your city"}
              </span>
              <span className="city-arrow">{dropOpen ? "▲" : "▼"}</span>
            </div>

            {dropOpen && (
              <div className="city-dropdown-panel">
                <div className="city-search-wrap">
                  <span className="city-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="city-search-input"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  {citySearch && (
                    <button className="city-search-clear" onClick={(e) => { e.stopPropagation(); setCitySearch(""); }}>✕</button>
                  )}
                </div>

                <ul className="city-list">
                  {MAHARASHTRA_CITIES
                    .filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
                    .map((c) => (
                      <li
                        key={c}
                        className={`city-list-item ${formData.city === c ? "city-selected" : ""}`}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, city: c }));
                          setDropOpen(false);
                          setCitySearch("");
                        }}
                      >
                        📍 {c}
                        {formData.city === c && <span className="city-tick">✓</span>}
                      </li>
                    ))
                  }
                  {MAHARASHTRA_CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                    <li className="city-no-result">
                      No city found for "{citySearch}"
                      <button className="city-add-manual-inline" onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, city: citySearch }));
                        setManualCity(true);
                        setDropOpen(false);
                      }}>
                        + Use "{citySearch}" as city
                      </button>
                    </li>
                  )}
                </ul>

                <div className="city-manual-link" onClick={(e) => { e.stopPropagation(); setManualCity(true); setDropOpen(false); }}>
                  ✏️ My city is not in the list — enter manually
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="city-manual-wrap">
            <input
              type="text"
              placeholder="Enter your city name"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`location-input ${errors.city ? "input-error" : ""}`}
              autoFocus
            />
            <button className="city-back-dropdown" onClick={() => { setManualCity(false); setFormData((prev) => ({ ...prev, city: "" })); }}>
              ← Back to dropdown
            </button>
          </div>
        )}
        {errors.city && <span className="error-msg">{errors.city}</span>}
      </div>

      <div className="form-group">
        <label className="field-label">Area / Locality *</label>
        <input
          type="text"
          name="locality"
          value={formData.locality}
          onChange={handleChange}
          placeholder="e.g. Shivaji Nagar, Kothrud"
          className={`form-control ${errors.locality ? "input-error" : ""}`}
        />
        {errors.locality && <span className="error-msg">{errors.locality}</span>}
      </div>

      <div className="form-group">
        <label className="field-label">Street Address *</label>
        <input
          type="text"
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleChange}
          placeholder="e.g. Flat 402, Royal Residency, Lane 4"
          className={`form-control ${errors.streetAddress ? "input-error" : ""}`}
        />
        {errors.streetAddress && <span className="error-msg">{errors.streetAddress}</span>}
      </div>

      <div className="form-row text-inputs">
        <div className="form-group half-width">
          <label className="field-label">Landmark</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            placeholder="e.g. Near Shiv Mandir"
            className="form-control"
          />
        </div>

        <div className="form-group half-width">
          <label className="field-label">Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="e.g. 411005"
            maxLength={6}
            className={`form-control ${errors.pincode ? "input-error" : ""}`}
          />
          {errors.pincode && <span className="error-msg">{errors.pincode}</span>}
        </div>
      </div>
    </div>
  );
}

export default LocationStep;
