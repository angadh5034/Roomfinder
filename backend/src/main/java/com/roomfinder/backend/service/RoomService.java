package com.roomfinder.backend.service;

import com.roomfinder.backend.dto.RoomDto;
import com.roomfinder.backend.entity.Room;
import com.roomfinder.backend.entity.User;
import com.roomfinder.backend.repository.RoomRepository;
import com.roomfinder.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomService {

        @Autowired
        private RoomRepository roomRepository;

        @Autowired
        private UserRepository userRepository;

        public List<RoomDto> getAllActiveRooms() {
                return roomRepository.findByManualStatusOrderByIdDesc("active").stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
        }

        public RoomDto getRoomById(Long id) {
                Room room = roomRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + id));
                return convertToDto(room);
        }

        public Long getUserIdByUsername(String username) {
                return userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username))
                                .getId();
        }

        public List<RoomDto> getRoomsByUser(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with username: " + username));
                return roomRepository.findByUserOrderByIdDesc(user).stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
        }

        public RoomDto createRoom(RoomDto roomDto, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with username: " + username));

                System.out.println("=== CREATE ROOM INCOMING DTO ===");
                System.out.println("DTO Title: " + roomDto.getTitle() + ", DTO Status: " + roomDto.getStatus() + ", DTO ManualStatus: " + roomDto.getManualStatus() + ", DTO Notes: " + roomDto.getNotes());

                Room room = convertToEntity(roomDto);
                room.setId(null);
                room.setUser(user);

                System.out.println("=== ROOM ENTITY BEFORE SAVE ===");
                System.out.println("Room Title: " + room.getTitle() + ", Room Status: " + room.getStatus() + ", Room ManualStatus: " + room.getManualStatus() + ", Room Notes: " + room.getNotes());

                Room savedRoom = roomRepository.save(room);
                return convertToDto(savedRoom);
        }

        public RoomDto updateRoom(Long roomId, RoomDto roomDto, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with username: " + username));

                Room room = roomRepository.findById(roomId)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + roomId));

                // Check ownership
                if (!room.getUser().getId().equals(user.getId())) {
                        throw new SecurityException("You do not have permission to edit this listing.");
                }

                System.out.println("=== UPDATE ROOM INCOMING DTO ===");
                System.out.println("DTO Title: " + roomDto.getTitle() + ", DTO Status: " + roomDto.getStatus() + ", DTO ManualStatus: " + roomDto.getManualStatus() + ", DTO Notes: " + roomDto.getNotes());

                String resolvedStatus = roomDto.getStatus() != null ? roomDto.getStatus() : roomDto.getManualStatus() != null ? roomDto.getManualStatus() : "active";
                String resolvedNotes = roomDto.getNotes() != null ? roomDto.getNotes() : roomDto.getDescription();

                // Update fields
                room.setTitle(roomDto.getTitle());
                room.setDescription(roomDto.getDescription());
                room.setListingType(roomDto.getListingType());
                room.setPropertyType(roomDto.getPropertyType());
                room.setAvailableFrom(roomDto.getAvailableFrom());
                room.setFurnishing(roomDto.getFurnishing());
                room.setCity(roomDto.getCity());
                room.setLocality(roomDto.getLocality());
                room.setLocation(roomDto.getLocation());
                room.setStreetAddress(roomDto.getStreetAddress());
                room.setLandmark(roomDto.getLandmark());
                room.setPincode(roomDto.getPincode());
                room.setBedrooms(roomDto.getBedrooms());
                room.setBathrooms(roomDto.getBathrooms());
                room.setOccupancy(roomDto.getOccupancy());
                room.setFloor(roomDto.getFloor());
                room.setTotalFloors(roomDto.getTotalFloors());
                room.setHasBalcony(roomDto.getHasBalcony());
                room.setHasAttachedBathroom(roomDto.getHasAttachedBathroom());
                room.setPropertyAge(roomDto.getPropertyAge());
                room.setParking(roomDto.getParking());
                room.setRent(roomDto.getRent());
                room.setRentType(roomDto.getRentType());
                room.setDeposit(roomDto.getDeposit());
                room.setNegotiable(roomDto.getNegotiable());
                room.setMaintenance(roomDto.getMaintenance());
                room.setMaintenanceAmount(roomDto.getMaintenanceAmount());
                room.setElectricity(roomDto.getElectricity());
                room.setWater(roomDto.getWater());
                room.setAmenities(roomDto.getAmenities());
                room.setPhotos(roomDto.getPhotos());
                room.setPreferredTenant(roomDto.getPreferredTenant());
                room.setSmokingAllowed(roomDto.getSmokingAllowed());
                room.setPetsAllowed(roomDto.getPetsAllowed());
                room.setFoodPreference(roomDto.getFoodPreference());
                room.setVisitorRules(roomDto.getVisitorRules());
                room.setAdditionalRules(roomDto.getAdditionalRules());
                room.setContactName(roomDto.getUploadedBy() != null ? roomDto.getUploadedBy().getName() : null);
                room.setContactPhone(roomDto.getUploadedBy() != null ? roomDto.getUploadedBy().getContact() : null);
                room.setContactEmail(roomDto.getUploadedBy() != null ? roomDto.getUploadedBy().getEmail() : null);
                room.setPreferredContact(roomDto.getPreferredContact());
                room.setHidePhone(roomDto.getHidePhone());
                room.setManualStatus(resolvedStatus);
                room.setStatus(resolvedStatus);
                room.setNotes(resolvedNotes);

                System.out.println("=== UPDATE ROOM ENTITY BEFORE SAVE ===");
                System.out.println("Room Status: " + room.getStatus() + ", Room ManualStatus: " + room.getManualStatus() + ", Room Notes: " + room.getNotes());

                Room updatedRoom = roomRepository.save(room);
                return convertToDto(updatedRoom);
        }

        public void deleteRoom(Long roomId, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with username: " + username));

                Room room = roomRepository.findById(roomId)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + roomId));

                // Check ownership
                if (!room.getUser().getId().equals(user.getId())) {
                        throw new SecurityException("You do not have permission to delete this listing.");
                }

                roomRepository.delete(room);
        }

        public RoomDto convertRoomToDto(Room room) {
                return convertToDto(room);
        }

        private RoomDto convertToDto(Room room) {
                RoomDto.UploadedByDto uploadedBy = RoomDto.UploadedByDto.builder()
                                .name(room.getContactName())
                                .contact(room.getContactPhone())
                                .email(room.getContactEmail())
                                .build();

                String resolvedStatus = room.getStatus() != null ? room.getStatus() : room.getManualStatus() != null ? room.getManualStatus() : "active";
                String resolvedNotes = room.getNotes() != null ? room.getNotes() : room.getDescription();

                return RoomDto.builder()
                                .id(room.getId())
                                .ownerId(room.getUser() != null ? room.getUser().getId() : null)
                                .photos(room.getPhotos())
                                .title(room.getTitle())
                                .description(room.getDescription())
                                .listingType(room.getListingType())
                                .propertyType(room.getPropertyType())
                                .availableFrom(room.getAvailableFrom())
                                .furnishing(room.getFurnishing())
                                .city(room.getCity())
                                .locality(room.getLocality())
                                .location(room.getLocation())
                                .streetAddress(room.getStreetAddress())
                                .landmark(room.getLandmark())
                                .pincode(room.getPincode())
                                .bedrooms(room.getBedrooms())
                                .bathrooms(room.getBathrooms())
                                .occupancy(room.getOccupancy())
                                .floor(room.getFloor())
                                .totalFloors(room.getTotalFloors())
                                .hasBalcony(room.getHasBalcony())
                                .hasAttachedBathroom(room.getHasAttachedBathroom())
                                .propertyAge(room.getPropertyAge())
                                .parking(room.getParking())
                                .rent(room.getRent())
                                .rentType(room.getRentType())
                                .deposit(room.getDeposit())
                                .negotiable(room.getNegotiable())
                                .maintenance(room.getMaintenance())
                                .maintenanceAmount(room.getMaintenanceAmount())
                                .electricity(room.getElectricity())
                                .water(room.getWater())
                                .amenities(room.getAmenities())
                                .preferredTenant(room.getPreferredTenant())
                                .smokingAllowed(room.getSmokingAllowed())
                                .petsAllowed(room.getPetsAllowed())
                                .foodPreference(room.getFoodPreference())
                                .visitorRules(room.getVisitorRules())
                                .additionalRules(room.getAdditionalRules())
                                .uploadedBy(uploadedBy)
                                .preferredContact(room.getPreferredContact())
                                .hidePhone(room.getHidePhone())
                                .postedAt(room.getPostedAt())
                                .manualStatus(resolvedStatus)
                                .status(resolvedStatus)
                                .notes(resolvedNotes)
                                .build();
        }

        private Room convertToEntity(RoomDto dto) {
                String resolvedStatus = dto.getStatus() != null ? dto.getStatus() : dto.getManualStatus() != null ? dto.getManualStatus() : "active";
                String resolvedNotes = dto.getNotes() != null ? dto.getNotes() : dto.getDescription();

                return Room.builder()
                                .id(dto.getId())
                                .photos(dto.getPhotos())
                                .title(dto.getTitle())
                                .description(dto.getDescription())
                                .listingType(dto.getListingType())
                                .propertyType(dto.getPropertyType())
                                .availableFrom(dto.getAvailableFrom())
                                .furnishing(dto.getFurnishing())
                                .city(dto.getCity())
                                .locality(dto.getLocality())
                                .location(dto.getLocation())
                                .streetAddress(dto.getStreetAddress())
                                .landmark(dto.getLandmark())
                                .pincode(dto.getPincode())
                                .bedrooms(dto.getBedrooms())
                                .bathrooms(dto.getBathrooms())
                                .occupancy(dto.getOccupancy())
                                .floor(dto.getFloor())
                                .totalFloors(dto.getTotalFloors())
                                .hasBalcony(dto.getHasBalcony())
                                .hasAttachedBathroom(dto.getHasAttachedBathroom())
                                .propertyAge(dto.getPropertyAge())
                                .parking(dto.getParking())
                                .rent(dto.getRent())
                                .rentType(dto.getRentType())
                                .deposit(dto.getDeposit())
                                .negotiable(dto.getNegotiable())
                                .maintenance(dto.getMaintenance())
                                .maintenanceAmount(dto.getMaintenanceAmount())
                                .electricity(dto.getElectricity())
                                .water(dto.getWater())
                                .amenities(dto.getAmenities())
                                .preferredTenant(dto.getPreferredTenant())
                                .smokingAllowed(dto.getSmokingAllowed())
                                .petsAllowed(dto.getPetsAllowed())
                                .foodPreference(dto.getFoodPreference())
                                .visitorRules(dto.getVisitorRules())
                                .additionalRules(dto.getAdditionalRules())
                                .contactName(dto.getUploadedBy() != null ? dto.getUploadedBy().getName() : null)
                                .contactPhone(dto.getUploadedBy() != null ? dto.getUploadedBy().getContact() : null)
                                .contactEmail(dto.getUploadedBy() != null ? dto.getUploadedBy().getEmail() : null)
                                .preferredContact(dto.getPreferredContact())
                                .hidePhone(dto.getHidePhone())
                                .postedAt(dto.getPostedAt())
                                .manualStatus(resolvedStatus)
                                .status(resolvedStatus)
                                .notes(resolvedNotes)
                                .build();
        }
}
