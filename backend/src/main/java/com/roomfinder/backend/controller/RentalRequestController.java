package com.roomfinder.backend.controller;

import com.roomfinder.backend.dto.RentalRequestDto;
import com.roomfinder.backend.service.RentalRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RentalRequestController {

    @Autowired
    private RentalRequestService rentalRequestService;

    /**
     * POST /api/requests/{roomId} or POST /api/requests/room/{roomId}
     * Create a rental request for a room.
     * Returns HTTP 201 Created on success.
     * Returns HTTP 403 Forbidden if loggedInUser.id == room.owner.id.
     */
    @PostMapping({"/{roomId}", "/room/{roomId}"})
    public ResponseEntity<?> createRequest(
            @PathVariable Long roomId,
            @RequestBody(required = false) RentalRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        System.out.println(">>> [RentalRequestController] Received POST /api/requests/" + roomId + " from user: " + (userDetails != null ? userDetails.getUsername() : "ANONYMOUS"));
        if (userDetails == null) {
            System.out.println(">>> [RentalRequestController] FAILED: User details null -> HTTP 401 Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required. Please login."));
        }
        if (dto == null) {
            dto = new RentalRequestDto();
        }
        try {
            RentalRequestDto created = rentalRequestService.createRequest(userDetails.getUsername(), roomId, dto);
            System.out.println(">>> [RentalRequestController] SUCCESS: Created request ID " + created.getId() + " -> HTTP 201 Created");
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SecurityException e) {
            System.out.println(">>> [RentalRequestController] FAILED SecurityException: " + e.getMessage() + " -> HTTP 403 Forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            System.out.println(">>> [RentalRequestController] FAILED IllegalArgumentException: " + e.getMessage() + " -> HTTP 400 Bad Request");
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.out.println(">>> [RentalRequestController] FAILED Exception: " + e.getMessage() + " -> HTTP 500 Internal Server Error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to create rental request: " + e.getMessage()));
        }
    }

    /**
     * GET /api/requests/incoming
     * Get all incoming requests for the owner's rooms.
     */
    @GetMapping("/incoming")
    public ResponseEntity<?> getIncomingRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required."));
        }
        System.out.println(">>> [RentalRequestController] Fetching incoming requests for owner: " + userDetails.getUsername());
        List<RentalRequestDto> requests = rentalRequestService.getIncomingRequests(userDetails.getUsername());
        System.out.println(">>> [RentalRequestController] Returning " + requests.size() + " incoming requests for " + userDetails.getUsername());
        return ResponseEntity.ok(requests);
    }

    /**
     * GET /api/requests/my-requests
     * Get all requests sent by the logged-in renter.
     */
    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required."));
        }
        System.out.println(">>> [RentalRequestController] Fetching sent requests for renter: " + userDetails.getUsername());
        List<RentalRequestDto> requests = rentalRequestService.getMyRequests(userDetails.getUsername());
        System.out.println(">>> [RentalRequestController] Returning " + requests.size() + " sent requests for " + userDetails.getUsername());
        return ResponseEntity.ok(requests);
    }

    /**
     * PUT /api/requests/{id}/accept
     * Direct endpoint to accept a rental request and create a RoomRenter record in MySQL.
     */
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required."));
        }
        System.out.println(">>> [RentalRequestController] Received PUT /api/requests/" + id + "/accept from owner: " + userDetails.getUsername());
        try {
            RentalRequestDto updated = rentalRequestService.updateStatus(userDetails.getUsername(), id, "accepted");
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * PUT /api/requests/{id}/status
     * Update request status to 'accepted' or 'rejected'.
     * Body: { "status": "accepted" }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required."));
        }
        String status = body != null ? body.get("status") : null;
        System.out.println(">>> [RentalRequestController] Received PUT /api/requests/" + id + "/status with status='" + status + "' from owner: " + userDetails.getUsername());
        if (status == null || (!status.equalsIgnoreCase("accepted") && !status.equalsIgnoreCase("rejected"))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status. Must be 'accepted' or 'rejected'."));
        }
        try {
            RentalRequestDto updated = rentalRequestService.updateStatus(userDetails.getUsername(), id, status);
            System.out.println(">>> [RentalRequestController] Successfully updated request ID " + id + " to status '" + status + "'");
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
