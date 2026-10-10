package com.roomfinder.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_renters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomRenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", nullable = false)
    private User renter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_request_id")
    private RentalRequest rentalRequest;

    @Column(name = "renter_name", nullable = false)
    private String renterName;

    @Column(name = "renter_contact", nullable = false)
    private String renterContact;

    @Column(name = "adhar_number")
    private String adharNumber;

    @Column(name = "adhar_front", columnDefinition = "LONGTEXT")
    private String adharFront;

    @Column(name = "adhar_back", columnDefinition = "LONGTEXT")
    private String adharBack;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;

    @Column(name = "duration")
    private String duration;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "Active";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
