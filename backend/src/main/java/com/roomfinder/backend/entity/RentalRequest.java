package com.roomfinder.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = true)
    private User tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "renter_name", nullable = false)
    private String name;

    @Column(name = "renter_contact", nullable = false)
    private String contact;

    @Column(name = "adhar_number")
    private String adharNumber;

    @Column(name = "adhar_front", columnDefinition = "LONGTEXT")
    private String adharFront;

    @Column(name = "adhar_back", columnDefinition = "LONGTEXT")
    private String adharBack;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "pending";

    @Column(name = "requested_at")
    private String requestedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
