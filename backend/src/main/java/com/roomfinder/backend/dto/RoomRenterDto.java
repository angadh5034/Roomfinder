package com.roomfinder.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomRenterDto {

    private Long id;
    private Long roomId;
    private Long ownerId;
    private Long renterId;
    private Long rentalRequestId;

    // Room Info
    private String roomTitle;
    private String roomPhoto;
    private String city;
    private Double rent;
    private String rentType;

    // Renter Details
    private String renterName;
    private String renterContact;
    private String adharNumber;
    private String adharFront;
    private String adharBack;

    // Dates & Status
    private String startDate;
    private String endDate;
    private String duration;
    private String status;
}
