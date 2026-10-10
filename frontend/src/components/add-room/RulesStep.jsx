import React from "react";

function RulesStep({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="step-container">
      <h3 className="step-heading">Step 7: Rules & Preferences</h3>
      <p className="step-desc">Enter the guidelines and tenant preferences for your room</p>

      <div className="form-row text-inputs">
        <div className="form-group half-width">
          <label className="field-label">Preferred Tenant</label>
          <select
            name="preferredTenant"
            value={formData.preferredTenant}
            onChange={handleChange}
            className="form-control-select"
          >
            {["Anyone", "Male", "Female", "Family", "Bachelors"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group half-width">
          <label className="field-label">Food Preference</label>
          <select
            name="foodPreference"
            value={formData.foodPreference}
            onChange={handleChange}
            className="form-control-select"
          >
            <option value="Any">Veg / Non-Veg (Any)</option>
            <option value="Veg only">Veg Only</option>
          </select>
        </div>
      </div>

      <div className="form-row text-inputs" style={{ marginTop: "16px" }}>
        <div className="form-group half-width">
          <label className="field-label">Smoking Rules</label>
          <select
            name="smokingAllowed"
            value={formData.smokingAllowed}
            onChange={handleChange}
            className="form-control-select"
          >
            <option value="Not allowed">Not Allowed</option>
            <option value="Allowed">Allowed</option>
          </select>
        </div>

        <div className="form-group half-width">
          <label className="field-label">Pets Rules</label>
          <select
            name="petsAllowed"
            value={formData.petsAllowed}
            onChange={handleChange}
            className="form-control-select"
          >
            <option value="Not allowed">Not Allowed</option>
            <option value="Allowed">Allowed</option>
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: "16px" }}>
        <label className="field-label">Visitor Rules</label>
        <select
          name="visitorRules"
          value={formData.visitorRules}
          onChange={handleChange}
          className="form-control-select"
        >
          <option value="Allowed">Allowed</option>
          <option value="No overnight stay">No overnight stay</option>
          <option value="Not allowed">Not Allowed</option>
        </select>
      </div>

      <div className="form-group" style={{ marginTop: "16px" }}>
        <label className="field-label">Additional House Rules</label>
        <textarea
          name="additionalRules"
          value={formData.additionalRules}
          onChange={handleChange}
          rows={3}
          placeholder="e.g. Keep common areas clean, quiet hours from 10 PM to 6 AM, etc."
          className="form-control-textarea"
        />
      </div>
    </div>
  );
}

export default RulesStep;
