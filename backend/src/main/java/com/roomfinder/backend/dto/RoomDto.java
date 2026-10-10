package com.roomfinder.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDto {

    private Long id;
    private Long ownerId;  // ID of the landlord who listed this room
    private List<String> photos;
    private String title;
    private String description;
    private String listingType;
    private String propertyType;
    private String availableFrom;
    private String furnishing;

    private String city;
    private String locality;
    private String location;
    private String streetAddress;
    private String landmark;
    private String pincode;

    private Integer bedrooms;
    private Integer bathrooms;
    private Integer occupancy;
    private Integer floor;
    private Integer totalFloors;
    private Boolean hasBalcony;
    private Boolean hasAttachedBathroom;
    private String propertyAge;
    private String parking;

    private Double rent;
    private String rentType;
    private Double deposit;
    private String negotiable;
    private String maintenance;
    private Double maintenanceAmount;
    private String electricity;
    private String water;

    private List<String> amenities;

    private String preferredTenant;
    private String smokingAllowed;
    private String petsAllowed;
    private String foodPreference;
    private String visitorRules;
    private String additionalRules;

    private UploadedByDto uploadedBy;

    private String preferredContact;
    private Boolean hidePhone;

    private String postedAt;
    private String manualStatus;
    private String status;
    private String notes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UploadedByDto {
        private String name;
        private String contact;
        private String email;
    }
}
