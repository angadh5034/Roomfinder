package com.roomfinder.backend.service;

import com.roomfinder.backend.dto.RoomRenterDto;
import com.roomfinder.backend.entity.RentalRequest;
import com.roomfinder.backend.entity.Room;
import com.roomfinder.backend.entity.RoomRenter;
import com.roomfinder.backend.entity.User;
import com.roomfinder.backend.repository.RoomRenterRepository;
import com.roomfinder.backend.repository.RoomRepository;
import com.roomfinder.backend.repository.UserRepository;
import com.roomfinder.backend.repository.RentalRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomRenterService {

    @Autowired
    private RoomRenterRepository roomRenterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RentalRequestRepository rentalRequestRepository;

    /**
     * Get all renters for the logged-in room owner.
     * Auto-syncs any accepted RentalRequests into room_renters records if not already created.
     */
    @Transactional
    public List<RoomRenterDto> getRentersForOwner(String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        System.out.println(">>> [RoomRenterService] Fetching renters for owner ID: " + owner.getId() + " (" + owner.getUsername() + ")");

        // 1. Scan for any accepted RentalRequest records for this owner and auto-create RoomRenter entries if missing
        List<RentalRequest> acceptedRequests = rentalRequestRepository.findByOwnerOrderByCreatedAtDesc(owner).stream()
                .filter(r -> "accepted".equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());

        System.out.println(">>> [RoomRenterService] Found " + acceptedRequests.size() + " accepted RentalRequests in rental_requests table for owner ID " + owner.getId());

        for (RentalRequest req : acceptedRequests) {
            try {
                createRenterFromRequest(req);
            } catch (Exception e) {
                System.out.println(">>> [RoomRenterService] Auto-sync notice for request ID " + req.getId() + ": " + e.getMessage());
            }
        }

        // 2. Retrieve all RoomRenter records for the owner
        List<RoomRenter> renters = roomRenterRepository.findByOwnerOrderByCreatedAtDesc(owner);
        System.out.println(">>> [RoomRenterService] Retrieved " + renters.size() + " RoomRenter records from room_renters table for owner ID " + owner.getId());

        return renters.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get renters for a specific room. Security check: only the room owner can access.
     */
    public List<RoomRenterDto> getRentersForRoom(Long roomId, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + roomId));

        if (!room.getUser().getId().equals(owner.getId())) {
            throw new SecurityException("You do not have permission to view renters for this room.");
        }

        return roomRenterRepository.findByRoomOrderByCreatedAtDesc(room).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Automatically create a RoomRenter record in MySQL when a rental request is accepted.
     */
    @Transactional
    public RoomRenterDto createRenterFromRequest(RentalRequest request) {
        Optional<RoomRenter> existing = roomRenterRepository.findByRentalRequest(request);
        if (existing.isPresent()) {
            return convertToDto(existing.get());
        }

        LocalDate today = LocalDate.now();
        LocalDate sixMonthsLater = today.plusMonths(6);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

        String startDateStr = today.format(formatter);
        String endDateStr = sixMonthsLater.format(formatter);

        RoomRenter renterRecord = RoomRenter.builder()
                .room(request.getRoom())
                .owner(request.getOwner())
                .renter(request.getRequester())
                .rentalRequest(request)
                .renterName(request.getName())
                .renterContact(request.getContact())
                .adharNumber(request.getAdharNumber())
                .adharFront(request.getAdharFront())
                .adharBack(request.getAdharBack())
                .startDate(startDateStr)
                .endDate(endDateStr)
                .duration("6 Months")
                .status("Active")
                .build();

        RoomRenter saved = roomRenterRepository.save(renterRecord);
        System.out.println(">>> [RoomRenterService] Created RoomRenter ID=" + saved.getId() + " for room ID=" + request.getRoom().getId() + " and tenant " + saved.getRenterName());
        return convertToDto(saved);
    }

    public RoomRenterDto convertToDto(RoomRenter record) {
        Room room = record.getRoom();
        String mainPhoto = "";
        if (room.getPhotos() != null && !room.getPhotos().isEmpty()) {
            mainPhoto = room.getPhotos().get(0);
        }

        return RoomRenterDto.builder()
                .id(record.getId())
                .roomId(room.getId())
                .ownerId(record.getOwner().getId())
                .renterId(record.getRenter().getId())
                .rentalRequestId(record.getRentalRequest() != null ? record.getRentalRequest().getId() : null)

                .roomTitle(room.getTitle())
                .roomPhoto(mainPhoto)
                .city(room.getCity())
                .rent(room.getRent())
                .rentType(room.getRentType())

                .renterName(record.getRenterName())
                .renterContact(record.getRenterContact())
                .adharNumber(record.getAdharNumber())
                .adharFront(record.getAdharFront())
                .adharBack(record.getAdharBack())

                .startDate(record.getStartDate())
                .endDate(record.getEndDate())
                .duration(record.getDuration())
                .status(record.getStatus())
                .build();
    }
}
