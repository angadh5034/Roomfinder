package com.roomfinder.backend.controller;

import com.roomfinder.backend.dto.RoomDto;
import com.roomfinder.backend.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomDto>> getAllRooms() {
        List<RoomDto> rooms = roomService.getAllActiveRooms();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDto> getRoomById(@PathVariable Long id) {
        try {
            RoomDto room = roomService.getRoomById(id);
            return ResponseEntity.ok(room);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/rooms/{id}/validate-request
     * Returns 403 if the authenticated user is the owner of the room.
     * Call this before submitting any rental request to enforce owner protection.
     */
    @PostMapping("/{id}/validate-request")
    public ResponseEntity<?> validateRentalRequest(
            @PathVariable Long id,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required."));
        }
        try {
            RoomDto room = roomService.getRoomById(id);
            // Fetch the requesting user's ID
            Long requesterId = roomService.getUserIdByUsername(principal.getName());
            if (room.getOwnerId() != null && room.getOwnerId().equals(requesterId)) {
                return ResponseEntity.status(403).body(
                    Map.of("message", "You cannot send a rental request for your own listing.")
                );
            }
            return ResponseEntity.ok(Map.of("valid", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/rooms/{id}/request
     * Validates that the requesting user is not the owner before processing a rental request.
     * Returns 403 Forbidden if loggedInUser.id == room.owner.id
     */
    @PostMapping("/{id}/request")
    public ResponseEntity<?> sendRentalRequest(
            @PathVariable Long id,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required."));
        }
        try {
            RoomDto room = roomService.getRoomById(id);
            Long requesterId = roomService.getUserIdByUsername(principal.getName());
            if (room.getOwnerId() != null && room.getOwnerId().equals(requesterId)) {
                return ResponseEntity.status(403).body(
                    Map.of("message", "You cannot send a rental request for your own listing.")
                );
            }
            return ResponseEntity.ok(Map.of("message", "Rental request sent successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/my-rooms")
    public ResponseEntity<List<RoomDto>> getMyRooms(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        List<RoomDto> rooms = roomService.getRoomsByUser(principal.getName());
        return ResponseEntity.ok(rooms);
    }

    @PostMapping
    public ResponseEntity<RoomDto> createRoom(@RequestBody RoomDto roomDto, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        System.out.println(">>> CONTROLLER RECEIVED CREATE ROOM PAYLOAD: Status=" + roomDto.getStatus() + ", ManualStatus=" + roomDto.getManualStatus() + ", Notes=" + roomDto.getNotes() + ", Description=" + roomDto.getDescription());
        RoomDto createdRoom = roomService.createRoom(roomDto, principal.getName());
        return ResponseEntity.ok(createdRoom);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomDto> updateRoom(@PathVariable Long id, @RequestBody RoomDto roomDto,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        System.out.println(">>> CONTROLLER RECEIVED UPDATE ROOM PAYLOAD: Status=" + roomDto.getStatus() + ", ManualStatus=" + roomDto.getManualStatus() + ", Notes=" + roomDto.getNotes() + ", Description=" + roomDto.getDescription());
        try {
            RoomDto updatedRoom = roomService.updateRoom(id, roomDto, principal.getName());
            return ResponseEntity.ok(updatedRoom);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            roomService.deleteRoom(id, principal.getName());
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
