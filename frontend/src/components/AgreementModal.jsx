import React, { useState } from "react";
import "../css/AgreementModal.css";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const FURNITURE_OPTIONS = [
  "Bed", "Mattress", "Cupboard", "Fan", "AC", "Wi-Fi",
  "Refrigerator", "Washing Machine", "Kitchen Access", "Geyser", "TV", "Sofa",
];

const PAYMENT_METHODS = ["UPI", "Bank Transfer", "Cash", "Cheque"];
const PROPERTY_TYPES  = ["Room", "PG", "Flat", "House"];

function AgreementModal({ renter, room, onClose }) {
  const [step, setStep] = useState(1); // 1 = fill form, 2 = preview/sign
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    // Agreement
    agreementDate: new Date().toISOString().split("T")[0],

    // Landlord
    landlordName: "",
    landlordAddress: "",
    landlordPhone: "",
    landlordEmail: "",

    // Tenant — prefilled from renter
    tenantName: renter?.name || "",
    tenantAddress: "",
    tenantPhone: renter?.contact || "",
    tenantEmail: "",
    tenantIdProof: renter?.adharNumber || "",

    // Property — prefilled from room
    propertyName: "Sweet Home Listing",
    propertyAddress: room?.location || "",
    propertyType: "Room",

    // Rental terms
    rentAmount: room?.rent || "",
    securityDeposit: "",
    startDate: renter?.rentFrom || "",
    endDate: renter?.rentTo || "",
    rentDueDate: "5th of every month",
    paymentMethod: "UPI",
    noticePeriod: "30 days",
    lockInPeriod: "",

    // Bills & charges
    maintenanceCharges: "",
    electricityBill: "Tenant",
    waterBill: "Tenant",
    internetBill: "Tenant",
    gasBill: "Tenant",

    // Rules
    noSmoking: true,
    noPets: true,
    visitorPolicy: "Visitors allowed till 9 PM",
    noiseRestriction: "Maintain quiet after 10 PM",
    parkingRules: "",

    // Witnesses
    witness1Name: "",
    witness1Phone: "",
    witness2Name: "",
    witness2Phone: "",
  });

  const [furniture, setFurniture] = useState([]);
  const [errors, setErrors] = useState({});

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const toggleFurniture = (item) => {
    setFurniture((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  const validate = () => {
    const e = {};
    if (!form.landlordName.trim())   e.landlordName   = "Required";
    if (!form.landlordPhone.trim())  e.landlordPhone  = "Required";
    if (!form.tenantAddress.trim())  e.tenantAddress  = "Required";
    if (!form.propertyAddress.trim())e.propertyAddress= "Required";
    if (!form.rentAmount)            e.rentAmount     = "Required";
    if (!form.securityDeposit)       e.securityDeposit= "Required";
    if (!form.startDate)             e.startDate      = "Required";
    if (!form.endDate)               e.endDate        = "Required";
    return e;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep(2);
  };

  const handlePrint = () => window.print();

  return (
    <div className="agm-overlay" onClick={onClose}>
      <div className="agm-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="agm-header">
          <h3>📄 Rental Agreement {step === 1 ? "— Fill Details" : "— Preview & Sign"}</h3>
          <button className="agm-close" onClick={onClose}>✕</button>
        </div>

        {/* Step indicator */}
        <div className="agm-steps">
          <div className={`agm-step-dot ${step === 1 ? "agm-step-active" : "agm-step-done"}`}>1</div>
          <div className="agm-step-line" />
          <div className={`agm-step-dot ${step === 2 ? "agm-step-active" : ""}`}>2</div>
          <span className="agm-step-label">{step === 1 ? "Fill agreement details" : "Review, sign & print"}</span>
        </div>

        {/* ───────── STEP 1 — FORM ───────── */}
        {step === 1 && (
          <div className="agm-body">

            {/* Agreement Date */}
            <div className="agm-section">
              <h4 className="agm-sec-title">📅 Agreement Date</h4>
              <div className="agm-row">
                <div className="agm-field">
                  <label>Agreement Date *</label>
                  <input type="date" name="agreementDate" value={form.agreementDate} onChange={handle} />
                </div>
              </div>
            </div>

            {/* Landlord */}
            <div className="agm-section">
              <h4 className="agm-sec-title">👤 Landlord Information</h4>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Full Name *</label>
                  <input name="landlordName" value={form.landlordName} onChange={handle}
                    placeholder="e.g. Angadh Dhole" className={errors.landlordName ? "agm-err" : ""} />
                  {errors.landlordName && <span className="agm-errmsg">{errors.landlordName}</span>}
                </div>
                <div className="agm-field">
                  <label>Phone Number *</label>
                  <input name="landlordPhone" value={form.landlordPhone} onChange={handle}
                    placeholder="10-digit number" maxLength={10} className={errors.landlordPhone ? "agm-err" : ""} />
                  {errors.landlordPhone && <span className="agm-errmsg">{errors.landlordPhone}</span>}
                </div>
              </div>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Email</label>
                  <input type="email" name="landlordEmail" value={form.landlordEmail} onChange={handle}
                    placeholder="email@example.com" />
                </div>
                <div className="agm-field">
                  <label>Address</label>
                  <input name="landlordAddress" value={form.landlordAddress} onChange={handle}
                    placeholder="Landlord's address" />
                </div>
              </div>
            </div>

            {/* Tenant */}
            <div className="agm-section">
              <h4 className="agm-sec-title">👤 Tenant Information</h4>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Full Name</label>
                  <input name="tenantName" value={form.tenantName} onChange={handle} disabled className="agm-disabled" />
                </div>
                <div className="agm-field">
                  <label>Phone Number</label>
                  <input name="tenantPhone" value={form.tenantPhone} onChange={handle} disabled className="agm-disabled" />
                </div>
              </div>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Email</label>
                  <input type="email" name="tenantEmail" value={form.tenantEmail} onChange={handle}
                    placeholder="email@example.com" />
                </div>
                <div className="agm-field">
                  <label>Aadhaar / ID Proof</label>
                  <input name="tenantIdProof" value={form.tenantIdProof} onChange={handle} disabled className="agm-disabled" />
                </div>
              </div>
              <div className="agm-field">
                <label>Tenant Address *</label>
                <input name="tenantAddress" value={form.tenantAddress} onChange={handle}
                  placeholder="Permanent / current address" className={errors.tenantAddress ? "agm-err" : ""} />
                {errors.tenantAddress && <span className="agm-errmsg">{errors.tenantAddress}</span>}
              </div>
            </div>

            {/* Property */}
            <div className="agm-section">
              <h4 className="agm-sec-title">🏠 Property Information</h4>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Property Name</label>
                  <input name="propertyName" value={form.propertyName} onChange={handle} />
                </div>
                <div className="agm-field">
                  <label>Property Type *</label>
                  <select name="propertyType" value={form.propertyType} onChange={handle}>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="agm-field">
                <label>Full Address *</label>
                <input name="propertyAddress" value={form.propertyAddress} onChange={handle}
                  placeholder="Complete room/flat address" className={errors.propertyAddress ? "agm-err" : ""} />
                {errors.propertyAddress && <span className="agm-errmsg">{errors.propertyAddress}</span>}
              </div>
            </div>

            {/* Rental Terms */}
            <div className="agm-section">
              <h4 className="agm-sec-title">📅 Rental Terms</h4>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Monthly Rent (₹) *</label>
                  <input type="number" name="rentAmount" value={form.rentAmount} onChange={handle}
                    className={errors.rentAmount ? "agm-err" : ""} />
                  {errors.rentAmount && <span className="agm-errmsg">{errors.rentAmount}</span>}
                </div>
                <div className="agm-field">
                  <label>Security Deposit (₹) *</label>
                  <input type="number" name="securityDeposit" value={form.securityDeposit} onChange={handle}
                    placeholder="e.g. 15000" className={errors.securityDeposit ? "agm-err" : ""} />
                  {errors.securityDeposit && <span className="agm-errmsg">{errors.securityDeposit}</span>}
                </div>
              </div>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Start Date *</label>
                  <input type="date" name="startDate" value={form.startDate} onChange={handle}
                    className={errors.startDate ? "agm-err" : ""} />
                  {errors.startDate && <span className="agm-errmsg">{errors.startDate}</span>}
                </div>
                <div className="agm-field">
                  <label>End Date *</label>
                  <input type="date" name="endDate" value={form.endDate} onChange={handle}
                    className={errors.endDate ? "agm-err" : ""} />
                  {errors.endDate && <span className="agm-errmsg">{errors.endDate}</span>}
                </div>
              </div>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Rent Due Date</label>
                  <input name="rentDueDate" value={form.rentDueDate} onChange={handle} />
                </div>
                <div className="agm-field">
                  <label>Payment Method</label>
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handle}>
                    {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Notice Period</label>
                  <input name="noticePeriod" value={form.noticePeriod} onChange={handle} />
                </div>
                <div className="agm-field">
                  <label>Lock-in Period <span className="agm-optional">(optional)</span></label>
                  <input name="lockInPeriod" value={form.lockInPeriod} onChange={handle} placeholder="e.g. 6 months" />
                </div>
              </div>
            </div>

            {/* Bills */}
            <div className="agm-section">
              <h4 className="agm-sec-title">💡 Bills & Charges</h4>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Maintenance Charges (₹)</label>
                  <input type="number" name="maintenanceCharges" value={form.maintenanceCharges} onChange={handle}
                    placeholder="e.g. 500" />
                </div>
              </div>
              <div className="agm-bills-grid">
                <div className="agm-bill-item">
                  <label>⚡ Electricity</label>
                  <select name="electricityBill" value={form.electricityBill} onChange={handle}>
                    <option>Tenant</option><option>Landlord</option><option>Shared</option>
                  </select>
                </div>
                <div className="agm-bill-item">
                  <label>💧 Water</label>
                  <select name="waterBill" value={form.waterBill} onChange={handle}>
                    <option>Tenant</option><option>Landlord</option><option>Shared</option>
                  </select>
                </div>
                <div className="agm-bill-item">
                  <label>🌐 Internet</label>
                  <select name="internetBill" value={form.internetBill} onChange={handle}>
                    <option>Tenant</option><option>Landlord</option><option>Shared</option>
                  </select>
                </div>
                <div className="agm-bill-item">
                  <label>🔥 Gas</label>
                  <select name="gasBill" value={form.gasBill} onChange={handle}>
                    <option>Tenant</option><option>Landlord</option><option>Shared</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="agm-section">
              <h4 className="agm-sec-title">📜 Rules & Conditions</h4>
              <div className="agm-checkbox-row">
                <label className="agm-checkbox">
                  <input type="checkbox" name="noSmoking" checked={form.noSmoking} onChange={handle} />
                  🚭 No Smoking
                </label>
                <label className="agm-checkbox">
                  <input type="checkbox" name="noPets" checked={form.noPets} onChange={handle} />
                  🐾 No Pets
                </label>
              </div>
              <div className="agm-field">
                <label>Visitor Policy</label>
                <input name="visitorPolicy" value={form.visitorPolicy} onChange={handle} />
              </div>
              <div className="agm-field">
                <label>Noise Restrictions</label>
                <input name="noiseRestriction" value={form.noiseRestriction} onChange={handle} />
              </div>
              <div className="agm-field">
                <label>Parking Rules</label>
                <input name="parkingRules" value={form.parkingRules} onChange={handle} placeholder="e.g. 1 two-wheeler allowed" />
              </div>
            </div>

            {/* Furniture */}
            <div className="agm-section">
              <h4 className="agm-sec-title">🛋️ Furniture & Appliances Included</h4>
              <div className="agm-furniture-grid">
                {FURNITURE_OPTIONS.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`agm-furniture-chip ${furniture.includes(item) ? "agm-chip-selected" : ""}`}
                    onClick={() => toggleFurniture(item)}
                  >
                    {furniture.includes(item) ? "✓ " : "+ "}{item}
                  </button>
                ))}
              </div>
            </div>

            {/* Witnesses */}
            <div className="agm-section">
              <h4 className="agm-sec-title">🧾 Witness Details <span className="agm-optional">(recommended)</span></h4>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Witness 1 Name</label>
                  <input name="witness1Name" value={form.witness1Name} onChange={handle} />
                </div>
                <div className="agm-field">
                  <label>Witness 1 Phone</label>
                  <input name="witness1Phone" value={form.witness1Phone} onChange={handle} maxLength={10} />
                </div>
              </div>
              <div className="agm-row agm-row-2">
                <div className="agm-field">
                  <label>Witness 2 Name</label>
                  <input name="witness2Name" value={form.witness2Name} onChange={handle} />
                </div>
                <div className="agm-field">
                  <label>Witness 2 Phone</label>
                  <input name="witness2Phone" value={form.witness2Phone} onChange={handle} maxLength={10} />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ───────── STEP 2 — PREVIEW / PRINT ───────── */}
        {step === 2 && (
          <div className="agm-body">
            <div className="agm-paper">

              <div className="agm-paper-header">
                <div className="agm-paper-logo">🏠 Sweet Home</div>
                <h2 className="agm-paper-title">RESIDENTIAL RENTAL AGREEMENT</h2>
                <p className="agm-paper-date">Agreement Date: {formatDate(form.agreementDate)}</p>
              </div>

              <div className="agm-paper-divider" />

              <p className="agm-paper-intro">
                This Rental Agreement is made and entered into on <strong>{formatDate(form.agreementDate)}</strong> between
                the Landlord and Tenant named below, for the property described herein, on the terms and conditions
                set out in this agreement.
              </p>

              {/* Landlord & Tenant */}
              <div className="agm-paper-section">
                <h4 className="agm-paper-sec-title">1. Parties to the Agreement</h4>
                <div className="agm-paper-2col">
                  <div className="agm-party-card">
                    <span className="agm-party-label">LANDLORD</span>
                    <span className="agm-party-name">{form.landlordName || "—"}</span>
                    <span className="agm-party-detail">📞 {form.landlordPhone || "—"}</span>
                    {form.landlordEmail && <span className="agm-party-detail">✉️ {form.landlordEmail}</span>}
                    {form.landlordAddress && <span className="agm-party-detail">📍 {form.landlordAddress}</span>}
                  </div>
                  <div className="agm-party-card">
                    <span className="agm-party-label">TENANT</span>
                    <span className="agm-party-name">{form.tenantName || "—"}</span>
                    <span className="agm-party-detail">📞 {form.tenantPhone || "—"}</span>
                    {form.tenantEmail && <span className="agm-party-detail">✉️ {form.tenantEmail}</span>}
                    <span className="agm-party-detail">🪪 {form.tenantIdProof || "—"}</span>
                    <span className="agm-party-detail">📍 {form.tenantAddress || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Property */}
              <div className="agm-paper-section">
                <h4 className="agm-paper-sec-title">2. Property Details</h4>
                <div className="agm-kv-grid">
                  <div className="agm-kv"><span>Property Name</span><strong>{form.propertyName}</strong></div>
                  <div className="agm-kv"><span>Property Type</span><strong>{form.propertyType}</strong></div>
                  <div className="agm-kv agm-kv-full"><span>Address</span><strong>{form.propertyAddress || "—"}</strong></div>
                </div>
              </div>

              {/* Rental Terms */}
              <div className="agm-paper-section">
                <h4 className="agm-paper-sec-title">3. Rental Terms</h4>
                <div className="agm-kv-grid">
                  <div className="agm-kv"><span>Monthly Rent</span><strong className="agm-highlight">₹{Number(form.rentAmount || 0).toLocaleString("en-IN")}</strong></div>
                  <div className="agm-kv"><span>Security Deposit</span><strong className="agm-highlight">₹{Number(form.securityDeposit || 0).toLocaleString("en-IN")}</strong></div>
                  <div className="agm-kv"><span>Start Date</span><strong>{formatDate(form.startDate)}</strong></div>
                  <div className="agm-kv"><span>End Date</span><strong>{formatDate(form.endDate)}</strong></div>
                  <div className="agm-kv"><span>Rent Due Date</span><strong>{form.rentDueDate}</strong></div>
                  <div className="agm-kv"><span>Payment Method</span><strong>{form.paymentMethod}</strong></div>
                  <div className="agm-kv"><span>Notice Period</span><strong>{form.noticePeriod}</strong></div>
                  <div className="agm-kv"><span>Lock-in Period</span><strong>{form.lockInPeriod || "Not applicable"}</strong></div>
                </div>
              </div>

              {/* Bills */}
              <div className="agm-paper-section">
                <h4 className="agm-paper-sec-title">4. Bills & Charges</h4>
                <div className="agm-kv-grid">
                  <div className="agm-kv"><span>Maintenance</span><strong>{form.maintenanceCharges ? `₹${form.maintenanceCharges}/month` : "Not applicable"}</strong></div>
                  <div className="agm-kv"><span>⚡ Electricity</span><strong>{form.electricityBill}</strong></div>
                  <div className="agm-kv"><span>💧 Water</span><strong>{form.waterBill}</strong></div>
                  <div className="agm-kv"><span>🌐 Internet</span><strong>{form.internetBill}</strong></div>
                  <div className="agm-kv"><span>🔥 Gas</span><strong>{form.gasBill}</strong></div>
                </div>
              </div>

              {/* Furniture */}
              {furniture.length > 0 && (
                <div className="agm-paper-section">
                  <h4 className="agm-paper-sec-title">5. Furniture & Appliances Included</h4>
                  <div className="agm-furniture-tags">
                    {furniture.map((f) => <span key={f} className="agm-furniture-tag">{f}</span>)}
                  </div>
                </div>
              )}

              {/* Rules */}
              <div className="agm-paper-section">
                <h4 className="agm-paper-sec-title">6. Rules & Conditions</h4>
                <ul className="agm-rules-list">
                  {form.noSmoking && <li>Smoking is strictly prohibited on the premises.</li>}
                  {form.noPets && <li>Pets are not allowed on the premises.</li>}
                  <li>Visitor Policy: {form.visitorPolicy}</li>
                  <li>Noise: {form.noiseRestriction}</li>
                  {form.parkingRules && <li>Parking: {form.parkingRules}</li>}
                </ul>
              </div>

              {/* Standard Terms */}
              <div className="agm-paper-section">
                <h4 className="agm-paper-sec-title">7. Responsibilities</h4>
                <div className="agm-paper-2col">
                  <div>
                    <p className="agm-resp-title">Landlord shall:</p>
                    <ul className="agm-rules-list">
                      <li>Maintain the structural condition of the property.</li>
                      <li>Provide peaceful possession to the tenant.</li>
                      <li>Return the security deposit within 30 days of vacating, less deductions.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="agm-resp-title">Tenant shall:</p>
                    <ul className="agm-rules-list">
                      <li>Pay rent on time as per the due date specified.</li>
                      <li>Maintain the property in good condition.</li>
                      <li>Not sublet without written consent of the landlord.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Witnesses */}
              {(form.witness1Name || form.witness2Name) && (
                <div className="agm-paper-section">
                  <h4 className="agm-paper-sec-title">8. Witnesses</h4>
                  <div className="agm-kv-grid">
                    {form.witness1Name && <div className="agm-kv"><span>Witness 1</span><strong>{form.witness1Name} {form.witness1Phone && `— ${form.witness1Phone}`}</strong></div>}
                    {form.witness2Name && <div className="agm-kv"><span>Witness 2</span><strong>{form.witness2Name} {form.witness2Phone && `— ${form.witness2Phone}`}</strong></div>}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="agm-signatures">
                <div className="agm-sign-box">
                  <div className="agm-sign-line" />
                  <span className="agm-sign-label">Landlord's Signature<br/>({form.landlordName || "____________"})</span>
                </div>
                <div className="agm-sign-box">
                  <div className="agm-sign-line" />
                  <span className="agm-sign-label">Tenant's Signature<br/>({form.tenantName || "____________"})</span>
                </div>
              </div>
              {(form.witness1Name || form.witness2Name) && (
                <div className="agm-signatures">
                  <div className="agm-sign-box">
                    <div className="agm-sign-line" />
                    <span className="agm-sign-label">Witness 1<br/>{form.witness1Name && `(${form.witness1Name})`}</span>
                  </div>
                  <div className="agm-sign-box">
                    <div className="agm-sign-line" />
                    <span className="agm-sign-label">Witness 2<br/>{form.witness2Name && `(${form.witness2Name})`}</span>
                  </div>
                </div>
              )}

            </div>

            <label className="agm-confirm-row">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>Both Landlord and Tenant have read, understood, and agreed to all terms in this agreement.</span>
            </label>
          </div>
        )}

        {/* Footer */}
        <div className="agm-footer">
          {step === 1 ? (
            <>
              <button className="agm-btn-cancel" onClick={onClose}>Cancel</button>
              <button className="agm-btn-next" onClick={handleNext}>Next: Preview →</button>
            </>
          ) : (
            <>
              <button className="agm-btn-cancel" onClick={() => setStep(1)}>← Back to Edit</button>
              <button className="agm-btn-print" onClick={handlePrint}>🖨️ Print</button>
              <button
                className={`agm-btn-confirm ${!agreed ? "agm-btn-disabled" : ""}`}
                disabled={!agreed}
                onClick={() => { alert("✅ Agreement confirmed!"); onClose(); }}
              >
                ✅ Confirm Agreement
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default AgreementModal;
