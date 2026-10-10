package com.roomfinder.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User user;

    private String title;

    @Column(columnDefinition = "TEXT")
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

    @ElementCollection
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    private List<String> amenities;

    @ElementCollection
    @CollectionTable(name = "room_photos", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "photo_url", columnDefinition = "LONGTEXT")
    private List<String> photos;

    private String preferredTenant;
    private String smokingAllowed;
    private String petsAllowed;
    private String foodPreference;
    private String visitorRules;

    @Column(columnDefinition = "TEXT")
    private String additionalRules;

    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private String preferredContact;
    private Boolean hidePhone;

    private String postedAt;
    private String manualStatus; // "active", "inactive", "draft"

    @Column(name = "status")
    private String status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
