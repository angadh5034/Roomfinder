import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";

function daysSince(dateStr) {
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}
function computeStatus(room) {
  if (room.manualStatus) return room.manualStatus;
  return daysSince(room.postedAt) >= 28 ? "inactive" : "active";
}

const demoRooms = [];

function PhotoSlider({ photos }) {
  const [current, setCurrent] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [direction, setDirection] = useState("next");

  const goTo = useCallback((index, dir) => {
    if (sliding || photos.length <= 1) return;
    setDirection(dir);
    setSliding(true);
    setTimeout(() => {
      setCurrent(index);
      setSliding(false);
    }, 300);
  }, [sliding, photos.length]);

  const prev = (e) => {
    e.stopPropagation();
    const index = current === 0 ? photos.length - 1 : current - 1;
    goTo(index, "prev");
  };

  const next = (e) => {
    e.stopPropagation();
    const index = current === photos.length - 1 ? 0 : current + 1;
    goTo(index, "next");
  };

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      const index = current === photos.length - 1 ? 0 : current + 1;
      goTo(index, "next");
    }, 3000);
    return () => clearInterval(timer);
  }, [current, photos.length, goTo]);

  return (
    <div className="slider-wrap">
      {/* Main image */}
      <div className={`slider-img-wrap ${sliding ? `slide-${direction}` : ""}`}>
        <img
          src={photos[current]}
          alt={`Room photo ${current + 1}`}
          className="slider-img"
        />
      </div>

      {/* Left / Right arrows */}
      {photos.length > 1 && (
        <>
          <button className="slider-arrow left" onClick={prev} aria-label="Previous photo">
            ‹
          </button>
          <button className="slider-arrow right" onClick={next} aria-label="Next photo">
            ›
          </button>
        </>
      )}

      {/* Photo counter */}
      <div className="slider-counter">
        📷 {current + 1} / {photos.length}
      </div>

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="slider-dots">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`slider-dot ${i === current ? "active" : ""}`}
              onClick={(e) => { e.stopPropagation(); goTo(i, i > current ? "next" : "prev"); }}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}



function RoomCard({ room, onFavorite, isFavorited, isLoggedIn }) {
  const status = computeStatus(room);
  const navigate = useNavigate();

  const handleFavoriteClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      onFavorite && onFavorite(room);
    }
  };

  return (
    <div className={`room-card ${status === "inactive" ? "card-dim" : ""}`}>
      {/* Photo Slider */}
      <PhotoSlider photos={room.photos} />

      {/* Status badge */}
      <div className={`home-status-badge ${status}`}>
        {status === "active" ? "● Active" : "● Inactive"}
      </div>

      {/* Card Body */}
      <div className="room-body">
        <div className="rent-tag">
          <span className="rent-amount">₹{room.rent.toLocaleString("en-IN")}</span>
          <span className="rent-slash">/</span>
          <span className="rent-type">{room.rentType === "per_month" ? "month" : "person"}</span>
        </div>

        {/* City name */}
        {room.city && (
          <div className="room-city">📍 {room.city}</div>
        )}

        {room.notes && (
          <p className="room-notes">
            {room.notes.length > 100 ? room.notes.slice(0, 100) + "..." : room.notes}
          </p>
        )}

        <div className="posted-date">📅 Posted {room.postedAt}</div>

        {/* Action buttons */}
        <div className="card-actions">
          <button
            className={`fav-btn ${isFavorited ? "fav-active" : ""}`}
            onClick={handleFavoriteClick}
          >
            {isFavorited ? "❤️ Saved" : "🤍 Favorite"}
          </button>
          <button
            className="more-btn"
            onClick={() => navigate(`/rooms/${room.id}`)}
          >
            More →
          </button>
        </div>
      </div>
    </div>
  );
}

function Home({ rooms = [], favorites = [], favoriteIds = new Set(), onFavorite, onRequest = () => {}, isLoggedIn }) {
  const allRooms = [...demoRooms, ...rooms];

  // ── Filter state ──
  const [statusFilter, setStatusFilter] = useState("active");
  const [citySearch,   setCitySearch]   = useState("");
  const [rentMin,      setRentMin]      = useState("");
  const [rentMax,      setRentMax]      = useState("");
  const [rentType,     setRentType]     = useState("all"); // "all" | "per_month" | "per_person"
  const [filtersOpen,  setFiltersOpen]  = useState(false);

  // Unique cities for quick-pick chips
  const allCities = [...new Set(allRooms.map((r) => r.city).filter(Boolean))].sort();

  // ── Apply all filters ──
  const filtered = allRooms.filter((r) => {
    if (statusFilter === "active" && computeStatus(r) !== "active") return false;
    if (citySearch.trim() && !r.city?.toLowerCase().includes(citySearch.trim().toLowerCase())) return false;
    if (rentMin && r.rent < Number(rentMin)) return false;
    if (rentMax && r.rent > Number(rentMax)) return false;
    if (rentType !== "all" && r.rentType !== rentType) return false;
    return true;
  });

  const hasFilters = citySearch || rentMin || rentMax || rentType !== "all";

  const clearFilters = () => {
    setCitySearch("");
    setRentMin("");
    setRentMax("");
    setRentType("all");
  };

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Find Your Perfect Room 🏠</h1>
        <p>Browse rooms listed by real people near you</p>
      </div>

      <div className="home-content">

        {/* ── Search + Filter Bar ── */}
        <div className="search-filter-bar">

          {/* City search input */}
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="city-search-input"
              placeholder="Search by city... e.g. Nagpur, Pune"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
            />
            {citySearch && (
              <button className="search-clear" onClick={() => setCitySearch("")}>✕</button>
            )}
          </div>

          {/* Toggle more filters */}
          <button
            className={`filter-toggle-btn ${filtersOpen ? "open" : ""} ${hasFilters ? "has-filters" : ""}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            ⚙️ Filters {hasFilters && <span className="filter-dot" />}
          </button>

          {/* Status tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${statusFilter === "active" ? "active" : ""}`}
              onClick={() => setStatusFilter("active")}
            >
              🟢 Active ({allRooms.filter(r => computeStatus(r) === "active").length})
            </button>
            <button
              className={`filter-tab ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({allRooms.length})
            </button>
          </div>
        </div>

        {/* ── Expanded Filters Panel ── */}
        {filtersOpen && (
          <div className="filter-panel">

            {/* City quick-pick chips */}
            <div className="filter-group">
              <span className="filter-label">📍 City</span>
              <div className="city-chips">
                <button
                  className={`city-chip ${!citySearch ? "city-chip-active" : ""}`}
                  onClick={() => setCitySearch("")}
                >All Cities</button>
                {allCities.map((c) => (
                  <button
                    key={c}
                    className={`city-chip ${citySearch === c ? "city-chip-active" : ""}`}
                    onClick={() => setCitySearch(citySearch === c ? "" : c)}
                  >{c}</button>
                ))}
              </div>
            </div>

            {/* Rent range */}
            <div className="filter-group">
              <span className="filter-label">💰 Rent Range (₹)</span>
              <div className="rent-range-row">
                <div className="rent-range-input">
                  <span>₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={rentMin}
                    onChange={(e) => setRentMin(e.target.value)}
                    min="0"
                  />
                </div>
                <span className="rent-range-sep">—</span>
                <div className="rent-range-input">
                  <span>₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={rentMax}
                    onChange={(e) => setRentMax(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              {/* Quick rent presets */}
              <div className="rent-presets">
                {[["Under ₹5k","","5000"],["₹5k–₹10k","5000","10000"],["Above ₹10k","10000",""]].map(([lbl,mn,mx]) => (
                  <button
                    key={lbl}
                    className={`rent-preset ${rentMin===mn&&rentMax===mx?"preset-active":""}`}
                    onClick={() => { setRentMin(mn); setRentMax(mx); }}
                  >{lbl}</button>
                ))}
              </div>
            </div>

            {/* Rent type */}
            <div className="filter-group">
              <span className="filter-label">🏷️ Rent Type</span>
              <div className="type-chips">
                {[["all","All"],["per_month","Per Month"],["per_person","Per Person"]].map(([val,lbl]) => (
                  <button
                    key={val}
                    className={`city-chip ${rentType===val?"city-chip-active":""}`}
                    onClick={() => setRentType(val)}
                  >{lbl}</button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {hasFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                ✕ Clear all filters
              </button>
            )}
          </div>
        )}

        {/* ── Results header ── */}
        <div className="section-head">
          <h2>
            {filtered.length} Room{filtered.length !== 1 ? "s" : ""} found
            {citySearch && <span className="results-city"> in {citySearch}</span>}
          </h2>
          {hasFilters && (
            <button className="clear-filters-sm" onClick={clearFilters}>Clear filters</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="no-rooms">
            <p>😕 No rooms found matching your filters.</p>
            <button className="add-room-link" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="rooms-grid">
            {filtered.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onFavorite={onFavorite}
                isFavorited={favoriteIds.has(room.id)}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;