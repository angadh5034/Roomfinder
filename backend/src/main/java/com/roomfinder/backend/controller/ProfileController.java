package com.roomfinder.backend.controller;

import com.roomfinder.backend.dto.UserProfileDto;
import com.roomfinder.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<UserProfileDto> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UserProfileDto profile = profileService.getProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserProfileDto> updateProfile(Principal principal, @RequestBody UserProfileDto profileDto) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UserProfileDto updatedProfile = profileService.updateProfile(principal.getName(), profileDto);
        return ResponseEntity.ok(updatedProfile);
    }
}
