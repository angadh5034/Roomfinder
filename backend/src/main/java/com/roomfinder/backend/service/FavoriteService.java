package com.roomfinder.backend.service;

import com.roomfinder.backend.dto.RoomDto;
import com.roomfinder.backend.entity.Favorite;
import com.roomfinder.backend.entity.Room;
import com.roomfinder.backend.entity.User;
import com.roomfinder.backend.repository.FavoriteRepository;
import com.roomfinder.backend.repository.RoomRepository;
import com.roomfinder.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomService roomService;

    /**
     * Toggle favorite: adds if not present, removes if already favorited.
     * Returns true if added, false if removed.
     */
    @Transactional
    public boolean toggleFavorite(String username, Long roomId) {
        User user = getUser(username);
        Room room = getRoom(roomId);

        if (favoriteRepository.existsByUserAndRoom(user, room)) {
            favoriteRepository.deleteByUserAndRoom(user, room);
            return false; // removed
        } else {
            Favorite favorite = Favorite.builder()
                    .user(user)
                    .room(room)
                    .build();
            favoriteRepository.save(favorite);
            return true; // added
        }
    }

    /**
     * Get all favorited rooms for a user as RoomDto list.
     */
    public List<RoomDto> getFavorites(String username) {
        User user = getUser(username);
        return favoriteRepository.findByUser(user).stream()
                .map(fav -> roomService.convertRoomToDto(fav.getRoom()))
                .collect(Collectors.toList());
    }

    /**
     * Get just the room IDs that a user has favorited.
     */
    public List<Long> getFavoriteRoomIds(String username) {
        User user = getUser(username);
        return favoriteRepository.findByUser(user).stream()
                .map(fav -> fav.getRoom().getId())
                .collect(Collectors.toList());
    }

    /**
     * Explicit remove (used by DELETE endpoint).
     */
    @Transactional
    public void removeFavorite(String username, Long roomId) {
        User user = getUser(username);
        Room room = getRoom(roomId);
        favoriteRepository.deleteByUserAndRoom(user, room);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private Room getRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));
    }
}
