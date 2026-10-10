package com.roomfinder.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String location;
    private String adharNumber;
    private String adharFront;
    private String adharBack;
}
