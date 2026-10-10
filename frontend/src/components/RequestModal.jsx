import React, { useState } from "react";

function RequestModal({ room, onSubmit, onClose }) {
  const [form, setForm]   = useState({ name: "", contact: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent]   = useState(false);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.contact.trim()) e.contact = "Contact is required";
    else if (!/^\d{10}$/.test(form.contact)) e.contact = "Enter valid 10-digit number";
    return e;
  };

  const handleSend = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({
      id:          Date.now(),
      roomId:      room.id,
      roomPhoto:   room.photos?.[0]?.url || room.photos?.[0] || "",
      roomRent:    room.rent,
      roomRentType:room.rentType,
      roomCity:    room.city || "",
      name:        form.name,
      contact:     form.contact,
      message:     form.message,
      status:      "pending",
      requestedAt: new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }),
    });
    setSent(true);
  };

  return (
    <div className="req-overlay" onClick={onClose}>
      <div className="req-modal" onClick={(e) => e.stopPropagation()}>
        <div className="req-modal-header">
          <h3>🏠 Request to Rent</h3>
          <button className="req-modal-close" onClick={onClose}>✕</button>
        </div>

        {sent ? (
          <div className="req-modal-body">
            <div className="req-success">
              <div className="req-success-icon">✅</div>
              <h4>Request Sent!</h4>
              <p>The owner will review your request and contact you soon.</p>
              <button className="req-close-btn" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="req-modal-body">
              {/* Room preview */}
              <div className="req-room-preview">
                <img src={room.photos?.[0]?.url || room.photos?.[0]} alt="Room" className="req-preview-img" />
                <div>
                  <div className="req-preview-rent">
                    ₹{room.rent?.toLocaleString("en-IN")}
                    <span className="req-preview-type">/ {room.rentType === "per_month" ? "month" : "person"}</span>
                  </div>
                  {room.city && <div className="req-preview-city">📍 {room.city}</div>}
                </div>
              </div>

              <div className="req-form-group">
                <label>Your Full Name *</label>
                <input name="name" value={form.name} onChange={handle}
                  placeholder="e.g. Rohit Sharma"
                  className={errors.name ? "req-input req-input-err" : "req-input"} />
                {errors.name && <span className="req-err">{errors.name}</span>}
              </div>

              <div className="req-form-group">
                <label>Contact Number *</label>
                <input name="contact" value={form.contact} onChange={handle}
                  placeholder="10-digit mobile number" maxLength={10}
                  className={errors.contact ? "req-input req-input-err" : "req-input"} />
                {errors.contact && <span className="req-err">{errors.contact}</span>}
              </div>

              <div className="req-form-group">
                <label>Message <span className="req-optional">(optional)</span></label>
                <textarea name="message" value={form.message} onChange={handle} rows={3}
                  placeholder="e.g. I am looking for a room from July. Is it available?"
                  className="req-textarea" />
              </div>
            </div>

            <div className="req-modal-footer">
              <button className="req-cancel-btn" onClick={onClose}>Cancel</button>
              <button className="req-send-btn" onClick={handleSend}>📨 Send Request</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RequestModal;
