package com.roomfinder.backend.repository;

import com.roomfinder.backend.entity.RentalRequest;
import com.roomfinder.backend.entity.Room;
import com.roomfinder.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentalRequestRepository extends JpaRepository<RentalRequest, Long> {

    List<RentalRequest> findByOwnerOrderByCreatedAtDesc(User owner);

    List<RentalRequest> findByRequesterOrderByCreatedAtDesc(User requester);

    Optional<RentalRequest> findByRequesterAndRoom(User requester, Room room);

    boolean existsByRequesterAndRoomAndStatus(User requester, Room room, String status);
}
