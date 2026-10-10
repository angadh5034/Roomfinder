package com.roomfinder.backend.controller;

import com.roomfinder.backend.dto.LoginRequest;
import com.roomfinder.backend.dto.RegisterRequest;
import com.roomfinder.backend.dto.JwtResponse;
import com.roomfinder.backend.entity.User;
import com.roomfinder.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Registration successful!");
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest request) {
        try {
            JwtResponse jwtResponse = authService.login(request);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(401).body(response);
        }
    }
}
