import React from "react";

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

function PhotosStep({ previews, setPreviews, errors, setErrors }) {
  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (previews.length + files.length > 10) {
      setErrors((prev) => ({ ...prev, photos: "Maximum 10 photos allowed" }));
      return;
    }

    try {
      const base64Promises = files.map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds the 5MB size limit.`);
        }
        const base64 = await fileToBase64(file);
        return {
          url: base64,
          name: file.name,
        };
      });
      
      const newPreviews = await Promise.all(base64Promises);
      setPreviews((prev) => [...prev, ...newPreviews]);
      setErrors((prev) => ({ ...prev, photos: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, photos: err.message }));
    }
  };

  const removePhoto = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => ({ ...prev, photos: "" }));
  };

  const setAsCover = (index) => {
    setPreviews((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  return (
    <div className="step-container">
      <h3 className="step-heading">Step 6: Photos</h3>
      <p className="step-desc">Upload photos of the room (Minimum 3, Maximum 10)</p>

      <label className="upload-zone" htmlFor="photo-input">
        <div className="upload-icon">📷</div>
        <p className="upload-text">Click to upload photos</p>
        <p className="upload-sub">JPG, PNG, WEBP supported • Max 5MB per file</p>
        <input
          id="photo-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotos}
          style={{ display: "none" }}
        />
      </label>
      {errors.photos && <span className="error-msg">{errors.photos}</span>}

      {previews.length > 0 && (
        <div className="photo-grid">
          {previews.map((p, i) => (
            <div key={i} className="photo-card">
              <img src={p.url} alt={`Room ${i + 1}`} />
              <button
                type="button"
                className="remove-photo"
                onClick={() => removePhoto(i)}
                title="Remove photo"
              >
                ✕
              </button>
              {i === 0 ? (
                <span className="main-badge">Cover Photo</span>
              ) : (
                <button
                  type="button"
                  className="set-cover-btn"
                  onClick={() => setAsCover(i)}
                >
                  Set as Cover
                </button>
              )}
            </div>
          ))}
          {previews.length < 10 && (
            <label htmlFor="photo-input" className="add-more-tile">
              <span>+</span>
              <p>Add more</p>
            </label>
          )}
        </div>
      )}
      
      <div className="photos-counter">
        Selected: <strong>{previews.length}</strong> / 10 (Required: at least 3)
      </div>
    </div>
  );
}

export default PhotosStep;
