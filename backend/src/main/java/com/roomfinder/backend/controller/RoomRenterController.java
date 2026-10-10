package com.roomfinder.backend.controller;

import com.roomfinder.backend.dto.RoomRenterDto;
import com.roomfinder.backend.service.RoomRenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/renters")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RoomRenterController {

    @Autowired
    private RoomRenterService roomRenterService;

    /**
     * GET /api/renters
     * Returns all accepted renters for the logged-in owner.
     */
    @GetMapping({"", "/"})
    public ResponseEntity<?> getRentersForOwner(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            System.out.println(">>> [RoomRenterController] UNAUTHORIZED GET /api/renters request: userDetails is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required."));
        }
        System.out.println(">>> [RoomRenterController] Received GET /api/renters from owner username: " + userDetails.getUsername());
        List<RoomRenterDto> renters = roomRenterService.getRentersForOwner(userDetails.getUsername());
        System.out.println(">>> [RoomRenterController] Returning " + renters.size() + " renters to frontend for owner: " + userDetails.getUsername());
        return ResponseEntity.ok(renters);
    }

    /**
     * GET /api/renters/room/{roomId}
     * Returns renters for a specific room.
     * Security: Only the room owner can access.
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getRentersForRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required."));
        }
        try {
            List<RoomRenterDto> renters = roomRenterService.getRentersForRoom(roomId, userDetails.getUsername());
            return ResponseEntity.ok(renters);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
