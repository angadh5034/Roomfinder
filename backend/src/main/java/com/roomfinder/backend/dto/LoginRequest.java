package com.roomfinder.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Identifier is required")
    private String identifier; // email or username

    @NotBlank(message = "Password is required")
    private String password;
}
