package com.roomfinder.backend.repository;

import com.roomfinder.backend.entity.Room;
import com.roomfinder.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByUserOrderByIdDesc(User user);
    List<Room> findByManualStatusOrderByIdDesc(String status);
    List<Room> findAllByOrderByIdDesc();
}
