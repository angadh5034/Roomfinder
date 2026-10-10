package com.roomfinder.backend.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRequestDto {

    private Long id;
    private Long roomId;
    private Long requesterId;
    private Long tenantId;
    private Long ownerId;

    // Room Info
    private String roomTitle;
    private String roomPhoto;
    private Double roomRent;
    private String roomRentType;
    private String roomCity;
    private String roomLocality;
    private Integer roomBedrooms;
    private Integer roomBathrooms;
    private String roomFurnishing;
    private List<String> roomAmenities;

    // Renter Info
    private String name;
    private String contact;
    private String adharNumber;
    private String adharFront;
    private String adharBack;
    private String message;

    // Status & Dates
    private String status;
    private String requestedAt;

    // Owner Info (for accepted privacy release)
    private String ownerName;
    private String ownerContact;
    private String ownerEmail;
    private String streetAddress;
    private String landmark;
    private String location;
}
