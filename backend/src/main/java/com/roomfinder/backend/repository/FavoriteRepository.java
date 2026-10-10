package com.roomfinder.backend.repository;

import com.roomfinder.backend.entity.Favorite;
import com.roomfinder.backend.entity.Room;
import com.roomfinder.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUser(User user);

    Optional<Favorite> findByUserAndRoom(User user, Room room);

    boolean existsByUserAndRoom(User user, Room room);

    void deleteByUserAndRoom(User user, Room room);
}
