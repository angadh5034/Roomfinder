package com.roomfinder.backend.service;

import com.roomfinder.backend.dto.RentalRequestDto;
import com.roomfinder.backend.dto.RoomRenterDto;
import com.roomfinder.backend.entity.RentalRequest;
import com.roomfinder.backend.entity.Room;
import com.roomfinder.backend.entity.User;
import com.roomfinder.backend.repository.RentalRequestRepository;
import com.roomfinder.backend.repository.RoomRepository;
import com.roomfinder.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RentalRequestService {

    @Autowired
    private RentalRequestRepository rentalRequestRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRenterService roomRenterService;

    /**
     * Create a new rental request in MySQL.
     * Enforces owner protection rule: loggedInUser.id != room.owner.id
     */
    @Transactional
    public RentalRequestDto createRequest(String username, Long roomId, RentalRequestDto dto) {
        System.out.println(">>> [RentalRequestService] Processing request for username=" + username + ", roomId=" + roomId);

        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + roomId));

        User owner = room.getUser();
        if (owner == null) {
            System.out.println(">>> [RentalRequestService] FAILED: Room owner is null for room " + roomId);
            throw new IllegalArgumentException("Room owner is not associated with this listing.");
        }

        System.out.println(">>> [RentalRequestService] Requester ID: " + requester.getId() + " (" + requester.getUsername() + "), Owner ID: " + owner.getId() + " (" + owner.getUsername() + ")");

        // Owner Guard Validation: Landlord cannot request their own listing
        if (requester.getId().equals(owner.getId())) {
            System.out.println(">>> [RentalRequestService] FAILED Owner Guard Validation: Requester ID " + requester.getId() + " matches Owner ID " + owner.getId());
            throw new SecurityException("You cannot send a rental request for your own listing.");
        }

        String formattedDate = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        String frontData = dto.getAdharFront() != null ? dto.getAdharFront() : requester.getAdharFront();
        String backData = dto.getAdharBack() != null ? dto.getAdharBack() : requester.getAdharBack();

        System.out.println(">>> [RentalRequestService] adharFront payload length: " + (frontData != null ? frontData.length() : 0) + " chars | Preview: " + (frontData != null && frontData.length() > 40 ? frontData.substring(0, 40) : frontData));
        System.out.println(">>> [RentalRequestService] adharBack payload length: " + (backData != null ? backData.length() : 0) + " chars | Preview: " + (backData != null && backData.length() > 40 ? backData.substring(0, 40) : backData));

        RentalRequest request = RentalRequest.builder()
                .room(room)
                .requester(requester)
                .tenant(requester)
                .owner(owner)
                .name(dto.getName() != null && !dto.getName().isBlank() ? dto.getName() : (requester.getFullName() != null ? requester.getFullName() : requester.getUsername()))
                .contact(dto.getContact() != null && !dto.getContact().isBlank() ? dto.getContact() : (requester.getPhone() != null ? requester.getPhone() : "N/A"))
                .adharNumber(dto.getAdharNumber() != null ? dto.getAdharNumber() : requester.getAdharNumber())
                .adharFront(frontData)
                .adharBack(backData)
                .message(dto.getMessage())
                .status("pending")
                .requestedAt(formattedDate)
                .build();

        RentalRequest saved = rentalRequestRepository.save(request);
        System.out.println(">>> [RentalRequestService] SUCCESS: Saved RentalRequest ID=" + saved.getId() + " to MySQL DB! Status: " + saved.getStatus());

        return convertToDto(saved);
    }

    /**
     * Get all incoming requests for the owner's listings.
     */
    public List<RentalRequestDto> getIncomingRequests(String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return rentalRequestRepository.findByOwnerOrderByCreatedAtDesc(owner).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all requests sent by the logged-in renter.
     */
    public List<RentalRequestDto> getMyRequests(String username) {
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return rentalRequestRepository.findByRequesterOrderByCreatedAtDesc(requester).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Update request status (Accept or Reject).
     * Only the listing owner can perform this action.
     * When accepted, automatically creates a RoomRenter record in MySQL.
     */
    @Transactional
    public RentalRequestDto updateStatus(String username, Long requestId, String newStatus) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        RentalRequest request = rentalRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + requestId));

        if (!request.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("Only the listing owner can update request status.");
        }

        String previousStatus = request.getStatus();
        String normalizedStatus = newStatus.toLowerCase();

        System.out.println(">>> [RentalRequestService] Processing updateStatus for Request ID: " + requestId);
        System.out.println(">>> [RentalRequestService] Logged-in Owner: ID=" + user.getId() + " (" + user.getUsername() + ")");
        System.out.println(">>> [RentalRequestService] Status BEFORE update: '" + previousStatus + "'");

        request.setStatus(normalizedStatus);
        RentalRequest saved = rentalRequestRepository.save(request);

        System.out.println(">>> [RentalRequestService] Status AFTER update: '" + saved.getStatus() + "'");

        if ("accepted".equalsIgnoreCase(normalizedStatus)) {
            System.out.println(">>> [RentalRequestService] Status is ACCEPTED. Triggering roomRenterService.createRenterFromRequest...");
            try {
                RoomRenterDto renterDto = roomRenterService.createRenterFromRequest(saved);
                System.out.println(">>> [RentalRequestService] RoomRenter record saved successfully! RoomRenter ID: " + renterDto.getId() + ", Tenant: " + renterDto.getRenterName());
            } catch (Exception e) {
                System.err.println(">>> [RentalRequestService] ERROR creating RoomRenter: " + e.getMessage());
                e.printStackTrace();
            }
        }

        return convertToDto(saved);
    }

    public RentalRequestDto convertToDto(RentalRequest req) {
        Room room = req.getRoom();
        User owner = req.getOwner();

        String mainPhoto = "";
        if (room.getPhotos() != null && !room.getPhotos().isEmpty()) {
            mainPhoto = room.getPhotos().get(0);
        }

        return RentalRequestDto.builder()
                .id(req.getId())
                .roomId(room.getId())
                .requesterId(req.getRequester().getId())
                .tenantId(req.getRequester().getId())
                .ownerId(owner.getId())

                .roomTitle(room.getTitle())
                .roomPhoto(mainPhoto)
                .roomRent(room.getRent())
                .roomRentType(room.getRentType())
                .roomCity(room.getCity())
                .roomLocality(room.getLocality())
                .roomBedrooms(room.getBedrooms())
                .roomBathrooms(room.getBathrooms())
                .roomFurnishing(room.getFurnishing())
                .roomAmenities(room.getAmenities())

                .name(req.getName())
                .contact(req.getContact())
                .adharNumber(req.getAdharNumber())
                .adharFront(req.getAdharFront())
                .adharBack(req.getAdharBack())
                .message(req.getMessage())

                .status(req.getStatus())
                .requestedAt(req.getRequestedAt())

                .ownerName(room.getContactName() != null ? room.getContactName() : owner.getFullName())
                .ownerContact(room.getContactPhone() != null ? room.getContactPhone() : owner.getPhone())
                .ownerEmail(room.getContactEmail() != null ? room.getContactEmail() : owner.getEmail())
                .streetAddress(room.getStreetAddress() != null ? room.getStreetAddress() : owner.getAddress())
                .landmark(room.getLandmark())
                .location(room.getLocation() != null ? room.getLocation() : owner.getLocation())
                .build();
    }
}
