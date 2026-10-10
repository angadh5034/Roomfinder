import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BasicDetailsStep from "../components/add-room/BasicDetailsStep";
import LocationStep from "../components/add-room/LocationStep";
import PropertyDetailsStep from "../components/add-room/PropertyDetailsStep";
import PricingStep from "../components/add-room/PricingStep";
import AmenitiesStep from "../components/add-room/AmenitiesStep";
import PhotosStep from "../components/add-room/PhotosStep";
import RulesStep from "../components/add-room/RulesStep";
import ContactStep from "../components/add-room/ContactStep";
import PreviewStep from "../components/add-room/PreviewStep";
import "../css/AddRoom.css";

const INITIAL_FORM_STATE = {
  // Step 1: Basic Details
  listingType: "private_room",
  propertyType: "Apartment",
  title: "",
  description: "",
  availableFrom: "",
  furnishing: "Semi-furnished",

  // Step 2: Location
  city: "",
  locality: "",
  streetAddress: "",
  landmark: "",
  pincode: "",

  // Step 3: Room/Property Details
  bedrooms: 1,
  bathrooms: 1,
  occupancy: 1,
  floor: 0,
  totalFloors: 1,
  hasBalcony: false,
  hasAttachedBathroom: false,
  propertyAge: "1-3 Years",
  parking: "None",

  // Step 4: Rent & Deposit
  rent: "",
  rentType: "per_month",
  deposit: "",
  maintenance: "Included",
  maintenanceAmount: "",
  electricity: "Separate",
  water: "Included",
  negotiable: "No",

  // Step 5: Amenities
  amenities: [],

  // Step 7: Rules
  preferredTenant: "Anyone",
  smokingAllowed: "Not allowed",
  petsAllowed: "Not allowed",
  foodPreference: "Any",
  visitorRules: "Allowed",
  additionalRules: "",

  // Step 8: Contact
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  preferredContact: "Phone",
  hidePhone: false,
};

function AddRoom({ onRoomAdded }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [previews, setPreviews] = useState([]); // Photos kept in parent React state (not local storage)
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const navigate = useNavigate();

  // ── 1. Draft Recovery ──
  useEffect(() => {
    const savedDraft = localStorage.getItem("sweethome_draft_listing");
    if (savedDraft) {
      setShowRestorePrompt(true);
    }

    // ── Prefill Contact Details from Backend GET /api/profile ──
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/api/profile", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const profile = await response.json();
          setFormData((prev) => ({
            ...prev,
            contactName: prev.contactName || profile.fullName || "",
            contactEmail: prev.contactEmail || profile.email || "",
            contactPhone: prev.contactPhone || profile.phone || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user profile for contact prefill:", err);
      }
    };

    fetchUserProfile();
  }, []);

  // ── 2. Auto-save draft ──
  useEffect(() => {
    if (formData !== INITIAL_FORM_STATE && !submitted) {
      const draftToSave = { ...formData, currentStep };
      localStorage.setItem("sweethome_draft_listing", JSON.stringify(draftToSave));
    }
  }, [formData, currentStep, submitted]);

  const handleRestoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem("sweethome_draft_listing");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
      }
    } catch (e) {
      console.error("Failed to restore draft", e);
    }
    setShowRestorePrompt(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("sweethome_draft_listing");
    setFormData(INITIAL_FORM_STATE);
    setPreviews([]);
    setCurrentStep(1);
    setShowRestorePrompt(false);
  };

  // ── 3. Step Validations ──
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Listing title is required";
      if (!formData.description.trim()) newErrors.description = "Listing description is required";
      if (!formData.availableFrom) newErrors.availableFrom = "Availability date is required";
    }
    if (step === 2) {
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.locality.trim()) newErrors.locality = "Locality / Area is required";
      if (!formData.streetAddress.trim()) newErrors.streetAddress = "Street address is required";
      if (!formData.pincode.trim()) {
        newErrors.pincode = "Pincode is required";
      } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
        newErrors.pincode = "Enter a valid 6-digit pincode";
      }
    }
    if (step === 3) {
      if (formData.floor === "") newErrors.floor = "Floor number is required";
      if (formData.totalFloors === "") newErrors.totalFloors = "Total floors count is required";
      if (Number(formData.floor) > Number(formData.totalFloors)) {
        newErrors.floor = "Floor number cannot exceed total floors";
      }
    }
    if (step === 4) {
      if (!formData.rent) {
        newErrors.rent = "Rent amount is required";
      } else if (Number(formData.rent) <= 0) {
        newErrors.rent = "Enter a valid rent amount";
      }
      if (!formData.deposit) {
        newErrors.deposit = "Security deposit is required";
      } else if (Number(formData.deposit) <= 0) {
        newErrors.deposit = "Enter a valid deposit amount";
      }
    }
    if (step === 6) {
      if (previews.length < 3) {
        newErrors.photos = "Upload at least 3 photos of the property";
      }
    }
    if (step === 8) {
      if (!formData.contactName.trim()) newErrors.contactName = "Contact name is required";
      if (!formData.contactPhone.trim()) {
        newErrors.contactPhone = "Contact phone number is required";
      } else if (!/^\d{10}$/.test(formData.contactPhone.trim())) {
        newErrors.contactPhone = "Enter a valid 10-digit mobile number";
      }
      if (!formData.contactEmail.trim()) {
        newErrors.contactEmail = "Contact email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        newErrors.contactEmail = "Enter a valid email address";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 9));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePublish = async () => {
    const finalRoomData = {
      photos: previews.map((p) => p.url),
      title: formData.title,
      description: formData.description,
      listingType: formData.listingType,
      propertyType: formData.propertyType,
      availableFrom: formData.availableFrom,
      furnishing: formData.furnishing,
      city: formData.city,
      locality: formData.locality,
      location: `${formData.locality}, ${formData.city}`,
      streetAddress: formData.streetAddress,
      landmark: formData.landmark,
      pincode: formData.pincode,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      occupancy: Number(formData.occupancy),
      floor: Number(formData.floor),
      totalFloors: Number(formData.totalFloors),
      hasBalcony: formData.hasBalcony,
      hasAttachedBathroom: formData.hasAttachedBathroom,
      propertyAge: formData.propertyAge,
      parking: formData.parking,
      rent: Number(formData.rent),
      rentType: formData.rentType,
      deposit: Number(formData.deposit),
      negotiable: formData.negotiable,
      maintenance: formData.maintenance,
      maintenanceAmount: Number(formData.maintenanceAmount) || 0,
      electricity: formData.electricity,
      water: formData.water,
      amenities: formData.amenities,
      preferredTenant: formData.preferredTenant,
      smokingAllowed: formData.smokingAllowed,
      petsAllowed: formData.petsAllowed,
      foodPreference: formData.foodPreference,
      visitorRules: formData.visitorRules,
      additionalRules: formData.additionalRules,
      uploadedBy: {
        name: formData.contactName,
        contact: formData.contactPhone,
        email: formData.contactEmail,
      },
      preferredContact: formData.preferredContact,
      hidePhone: formData.hidePhone,
      postedAt: new Date().toLocaleDateString("en-IN"),
      manualStatus: "active",
      status: "active",
      notes: formData.notes || formData.description || "Room listed for rent.",
    };

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:8080/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(finalRoomData),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const savedRoom = await response.json();
      console.log("Saved room:", savedRoom);

      if (onRoomAdded) {
        onRoomAdded(savedRoom);
      }

      localStorage.removeItem("sweethome_draft_listing");
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to publish room:", error);
      alert("Failed to publish room. Please try again.");
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setPreviews([]);
    setCurrentStep(1);
    setErrors({});
    setSubmitted(false);
  };

  // ── Render Step Component ──
  const renderStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <BasicDetailsStep formData={formData} setFormData={setFormData} errors={errors} />;
      case 2:
        return <LocationStep formData={formData} setFormData={setFormData} errors={errors} />;
      case 3:
        return <PropertyDetailsStep formData={formData} setFormData={setFormData} errors={errors} />;
      case 4:
        return <PricingStep formData={formData} setFormData={setFormData} errors={errors} />;
      case 5:
        return <AmenitiesStep formData={formData} setFormData={setFormData} />;
      case 6:
        return <PhotosStep previews={previews} setPreviews={setPreviews} errors={errors} setErrors={setErrors} />;
      case 7:
        return <RulesStep formData={formData} setFormData={setFormData} />;
      case 8:
        return <ContactStep formData={formData} setFormData={setFormData} errors={errors} />;
      case 9:
        return (
          <PreviewStep
            formData={formData}
            previews={previews}
            onPublish={handlePublish}
            errors={errors}
            setErrors={setErrors}
          />
        );
      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="addroom-page">
        <div className="success-box">
          <div className="success-icon">🎉</div>
          <h2>Room Published Successfully!</h2>
          <p>Your listing has been submitted and is now live on the Explore Rooms feed.</p>
          <div className="success-actions">
            <button className="btn-primary" onClick={handleReset}>
              ➕ Add Another Room
            </button>
            <button className="btn-secondary" onClick={() => navigate("/profile", { state: { activeTab: "myrooms" } })}>
              🏠 Go to My Rooms
            </button>
            <Link to="/" className="btn-secondary">🔍 Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="addroom-page">
      {/* Draft Restoration Prompt */}
      {showRestorePrompt && (
        <div className="draft-prompt-overlay">
          <div className="draft-prompt-card">
            <h3>Unfinished Draft Found</h3>
            <p>You have an unfinished room listing draft. Would you like to resume where you left off?</p>
            <div className="draft-prompt-actions">
              <button className="btn-restore" onClick={handleRestoreDraft}>
                ✏️ Resume Draft
              </button>
              <button className="btn-discard" onClick={handleDiscardDraft}>
                🗑️ Start New
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="addroom-wrapper">
        <div className="addroom-header">
          <h1>🏠 List Your Property</h1>
          <p>Complete the steps below to list your room for rent</p>
        </div>

        {/* Steps Tracker / Progress Bar */}
        <div className="wizard-progress-bar">
          <div className="progress-bar-fill" style={{ width: `${((currentStep - 1) / 8) * 100}%` }}></div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNum) => (
            <div
              key={stepNum}
              className={`progress-step-node ${stepNum === currentStep ? "active" : ""} ${
                stepNum < currentStep ? "completed" : ""
              }`}
              onClick={() => {
                // Allow jumping to completed steps or step 1
                if (stepNum < currentStep) {
                  setCurrentStep(stepNum);
                }
              }}
            >
              {stepNum < currentStep ? "✓" : stepNum}
              <span className="step-node-label">
                {
                  [
                    "Basic",
                    "Location",
                    "Details",
                    "Pricing",
                    "Amenities",
                    "Photos",
                    "Rules",
                    "Contact",
                    "Preview",
                  ][stepNum - 1]
                }
              </span>
            </div>
          ))}
        </div>

        {/* Active Wizard Step Panel */}
        <div className="form-card modular-step-card">{renderStepComponent()}</div>

        {/* Wizard Controls Bar */}
        {currentStep < 9 && (
          <div className="wizard-navigation-bar">
            {currentStep > 1 && (
              <button type="button" className="btn-wizard-nav prev-btn" onClick={handlePrev}>
                ← Previous
              </button>
            )}
            <span className="draft-autosave-indicator">✓ Draft saved automatically</span>
            <button type="button" className="btn-wizard-nav next-btn" onClick={handleNext}>
              Next Step →
            </button>
          </div>
        )}

        {currentStep === 9 && (
          <div className="wizard-navigation-bar">
            <button type="button" className="btn-wizard-nav prev-btn" onClick={handlePrev}>
              ← Edit Details
            </button>
            <span className="draft-autosave-indicator">✓ Draft saved automatically</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddRoom;
