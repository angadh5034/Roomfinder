import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AddRoom from "./pages/AddRoom";
import Profile from "./pages/Profile";
import EditRoom from "./pages/EditRoom";
import Renter from "./pages/Renter";
import Favorites from "./pages/Favorites";
import RoomDetail from "./pages/RoomDetail";
import OwnerRequests from "./pages/OwnerRequests";
import RenterRequests from "./pages/RenterRequests";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/global.css";

const initialRentedRooms = [];

function App() {
  // ── Authentication state determined by presence of JWT token ──
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("authToken");
  });

  // ── Logged-in user's DB ID (from JWT login response saved in localStorage) ──
  const [currentUserId, setCurrentUserId] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u.id ? Number(u.id) : null;
    } catch { return null; }
  });

  // Keep currentUserId in sync when login/logout happens
  useEffect(() => {
    if (isLoggedIn) {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        setCurrentUserId(u.id ? Number(u.id) : null);
      } catch { setCurrentUserId(null); }
    } else {
      setCurrentUserId(null);
    }
  }, [isLoggedIn]);

  const handleAuthFailure = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setTenantProfile({
      username: "", fullName: "", email: "", phone: "",
      address: "", city: "", state: "", pincode: "", location: "",
      adharNumber: "", adharFront: null, adharBack: null,
    });
  };

  // ── Rooms state (public active rooms feed) ──
  const [rooms, setRooms] = useState([]);
  
  // ── My Rooms state (user-specific rooms) ──
  const [myRooms, setMyRooms] = useState([]);

  // Fetch all active rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/rooms");
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        }
      } catch (err) {
        console.warn("Failed to fetch public rooms from API", err);
      }
    };
    fetchRooms();
  }, []);

  // Fetch logged in user's rooms
  useEffect(() => {
    const fetchMyRooms = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8080/api/rooms/my-rooms", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMyRooms(data);
        } else {
          console.warn("fetchMyRooms: server returned", response.status, "— keeping session");
        }
      } catch (err) {
        console.warn("Failed to fetch my rooms from API", err);
      }
    };

    if (isLoggedIn) {
      fetchMyRooms();
    } else {
      setMyRooms([]);
    }
  }, [isLoggedIn]);

  // ── Tenant profile state loaded dynamically from backend API ──
  const [tenantProfile, setTenantProfile] = useState({
    username: "", fullName: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "", location: "",
    adharNumber: "", adharFront: null, adharBack: null,
  });

  // ── Fetch profile from backend when logged in to sync info immediately ──
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/api/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const dbProfile = await response.json();
          setTenantProfile(dbProfile);
        } else {
          console.warn("fetchProfile: server returned", response.status, "— keeping session");
        }
      } catch (err) {
        console.warn("Failed to fetch profile in App root", err);
      }
    };

    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  // ── Rented rooms persisted in localStorage ──
  const [rentedRooms, setRentedRooms] = useState(() => {
    try {
      const saved = localStorage.getItem("sweethome_rented_rooms");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try { localStorage.setItem("sweethome_rented_rooms", JSON.stringify(rentedRooms)); }
    catch {}
  }, [rentedRooms]);

  // ── Favorites — loaded from DB, not localStorage ──
  const [favorites, setFavorites] = useState([]); // list of RoomDto
  const [favoriteIds, setFavoriteIds] = useState(new Set()); // Set<Long> for O(1) heart check

  // Fetch user's favorites from backend when logged in
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8080/api/favorites", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
          setFavoriteIds(new Set(data.map((r) => r.id)));
        } else {
          console.warn("fetchFavorites: server returned", response.status);
        }
      } catch (err) {
        console.warn("Failed to fetch favorites", err);
      }
    };

    if (isLoggedIn) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [isLoggedIn]);

  // ── Requests — loaded dynamically from MySQL Database API ──
  const [requests, setRequests] = useState([]);

  // Fetch incoming & sent requests from backend API when logged in
  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const [incomingRes, sentRes] = await Promise.all([
          fetch("http://localhost:8080/api/requests/incoming", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("http://localhost:8080/api/requests/my-requests", {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        let combined = [];
        if (incomingRes.ok) {
          const incoming = await incomingRes.json();
          combined = [...incoming];
        }
        if (sentRes.ok) {
          const sent = await sentRes.json();
          // Merge sent avoiding duplicates
          const incomingIds = new Set(combined.map((r) => r.id));
          sent.forEach((s) => {
            if (!incomingIds.has(s.id)) combined.push(s);
          });
        }
        setRequests(combined);
      } catch (err) {
        console.warn("Failed to fetch requests from DB", err);
      }
    };

    if (isLoggedIn) {
      fetchRequests();
    } else {
      setRequests([]);
    }
  }, [isLoggedIn]);

  // ── Called from Home / RoomDetail / Favorites → onSubmit ──
  const handleRequest = (requestData) => {
    if (!requestData) return;
    setRequests((prev) => {
      const exists = prev.some((r) => r.id === requestData.id);
      if (exists) {
        return prev.map((r) => (r.id === requestData.id ? requestData : r));
      }
      return [requestData, ...prev];
    });
  };

  // ── Called from Requests pages → Accept / Reject ──
  const handleRequestStatusChange = async (id, status) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const response = await fetch(`http://localhost:8080/api/requests/${id}/status`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        });

        if (response.ok) {
          const updatedReq = await response.json();
          setRequests((prev) => prev.map((r) => (r.id === id ? updatedReq : r)));
          return;
        }
      } catch (err) {
        console.warn("Failed to update request status in DB", err);
      }
    }

    // Local fallback
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const handleFavorite = async (room) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/favorites/${room.id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.favorited) {
          // Added to favorites
          setFavorites((prev) => [...prev, room]);
          setFavoriteIds((prev) => new Set([...prev, room.id]));
        } else {
          // Removed from favorites
          setFavorites((prev) => prev.filter((f) => f.id !== room.id));
          setFavoriteIds((prev) => { const s = new Set(prev); s.delete(room.id); return s; });
        }
      } else {
        console.warn("toggleFavorite: server returned", response.status);
      }
    } catch (err) {
      console.warn("Failed to toggle favorite", err);
    }
  };

  const handleRemoveFavorite = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      await fetch(`http://localhost:8080/api/favorites/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (err) {
      console.warn("Failed to remove favorite", err);
    }
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    setFavoriteIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleDeleteRoom = async (id) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await fetch(`http://localhost:8080/api/rooms/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          setRooms((prev) => prev.filter((r) => r.id !== id));
          setMyRooms((prev) => prev.filter((r) => r.id !== id));
          return;
        } else if (response.status === 401 || response.status === 403) {
          handleAuthFailure();
        }
      } catch (err) {
        console.warn("Failed to delete room on server", err);
      }
    }
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setMyRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRoomAdded = (savedRoom) => {
    // AddRoom.jsx already POSTed to the API and got back savedRoom.
    // Just update React state — no second API call needed.
    setRooms((prev) => [savedRoom, ...prev]);
    setMyRooms((prev) => [savedRoom, ...prev]);
  };

  return (
    <Router>
      <Navbar
        favCount={favorites.length}
        isLoggedIn={isLoggedIn}
        tenantProfile={tenantProfile}
        roomsCount={myRooms.length}
        requestsCount={requests.length}
        onLogout={handleAuthFailure}
      />
      <Routes>
        <Route path="/" element={
          <Home
            rooms={rooms}
            favorites={favorites}
            favoriteIds={favoriteIds}
            onFavorite={handleFavorite}
            onRequest={handleRequest}
            isLoggedIn={isLoggedIn}
            currentUserId={currentUserId}
          />
        } />
        <Route path="/login"     element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/addroom"   element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <AddRoom onRoomAdded={handleRoomAdded} />
          </ProtectedRoute>
        } />
        <Route path="/profile"   element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Profile
              rooms={myRooms}
              requests={requests}
              onRequestStatusChange={handleRequestStatusChange}
              tenantProfile={tenantProfile}
              onProfileSave={setTenantProfile}
              onDeleteRoom={handleDeleteRoom}
              isLoggedIn={isLoggedIn}
            />
          </ProtectedRoute>
        } />
        <Route path="/editroom"  element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <EditRoom />
          </ProtectedRoute>
        } />
        <Route path="/renters"   element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Renter isLoggedIn={isLoggedIn} />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <Favorites
            favorites={favorites}
            onRemove={handleRemoveFavorite}
            onRequest={handleRequest}
            requestedIds={requests.map((r) => r.roomId)}
            tenantProfile={tenantProfile}
            currentUserId={currentUserId}
          />
        } />
        <Route path="/rooms/:id" element={
          <RoomDetail
            rooms={rooms}
            requests={requests}
            onRequest={handleRequest}
            isLoggedIn={isLoggedIn}
            tenantProfile={tenantProfile}
            currentUserId={currentUserId}
          />
        } />
        <Route path="/incoming-requests" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <OwnerRequests
              requests={requests}
              onRequestStatusChange={handleRequestStatusChange}
              currentUserId={currentUserId}
              rooms={rooms}
            />
          </ProtectedRoute>
        } />
        <Route path="/owner/requests" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <OwnerRequests
              requests={requests}
              onRequestStatusChange={handleRequestStatusChange}
              currentUserId={currentUserId}
              rooms={rooms}
            />
          </ProtectedRoute>
        } />
        <Route path="/my-requests" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <RenterRequests
              requests={requests}
              currentUserId={currentUserId}
              rooms={rooms}
              tenantProfile={tenantProfile}
            />
          </ProtectedRoute>
        } />
        <Route path="/renter/requests" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <RenterRequests
              requests={requests}
              currentUserId={currentUserId}
              rooms={rooms}
              tenantProfile={tenantProfile}
            />
          </ProtectedRoute>
        } />
        <Route path="/services"  element={<div style={{padding:"60px",textAlign:"center",color:"#6b7a90"}}>Services Page</div>} />
        <Route path="/about"     element={<div style={{padding:"60px",textAlign:"center",color:"#6b7a90"}}>About Page</div>} />
        <Route path="/contact"   element={<div style={{padding:"60px",textAlign:"center",color:"#6b7a90"}}>Contact Page</div>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;