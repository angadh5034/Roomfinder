package com.roomfinder.backend.controller;

import com.roomfinder.backend.dto.RoomDto;
import com.roomfinder.backend.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    /**
     * POST /api/favorites/{roomId}
     * Toggle favorite: adds if not present, removes if already favorited.
     */
    @PostMapping("/{roomId}")
    public ResponseEntity<?> toggleFavorite(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean added = favoriteService.toggleFavorite(userDetails.getUsername(), roomId);
        return ResponseEntity.ok(Map.of(
                "favorited", added,
                "roomId", roomId
        ));
    }

    /**
     * GET /api/favorites
     * Returns all favorited rooms (as RoomDto) for the logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<RoomDto>> getFavorites(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<RoomDto> favorites = favoriteService.getFavorites(userDetails.getUsername());
        return ResponseEntity.ok(favorites);
    }

    /**
     * GET /api/favorites/ids
     * Returns just the room IDs that the user has favorited (for heart highlighting).
     */
    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getFavoriteIds(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Long> ids = favoriteService.getFavoriteRoomIds(userDetails.getUsername());
        return ResponseEntity.ok(ids);
    }

    /**
     * DELETE /api/favorites/{roomId}
     * Explicit remove (also handled by toggle, but provided for clarity).
     */
    @DeleteMapping("/{roomId}")
    public ResponseEntity<?> removeFavorite(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        favoriteService.removeFavorite(userDetails.getUsername(), roomId);
        return ResponseEntity.ok(Map.of("removed", true, "roomId", roomId));
    }
}
