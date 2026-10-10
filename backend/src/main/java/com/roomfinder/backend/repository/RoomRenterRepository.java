package com.roomfinder.backend.repository;

import com.roomfinder.backend.entity.Room;
import com.roomfinder.backend.entity.RoomRenter;
import com.roomfinder.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRenterRepository extends JpaRepository<RoomRenter, Long> {

    List<RoomRenter> findByOwnerOrderByCreatedAtDesc(User owner);

    List<RoomRenter> findByRoomOrderByCreatedAtDesc(Room room);

    Optional<RoomRenter> findByRentalRequest(com.roomfinder.backend.entity.RentalRequest rentalRequest);
}
