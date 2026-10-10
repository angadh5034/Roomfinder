package com.roomfinder.backend.service;

import com.roomfinder.backend.dto.UserProfileDto;
import com.roomfinder.backend.entity.User;
import com.roomfinder.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    public UserProfileDto getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return convertToDto(user);
    }

    public UserProfileDto updateProfile(String username, UserProfileDto profileDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        user.setFullName(profileDto.getFullName());
        user.setPhone(profileDto.getPhone());
        user.setAddress(profileDto.getAddress());
        user.setCity(profileDto.getCity());
        user.setState(profileDto.getState());
        user.setPincode(profileDto.getPincode());
        user.setLocation(profileDto.getLocation());
        user.setAdharNumber(profileDto.getAdharNumber());
        
        if (profileDto.getAdharFront() != null) {
            user.setAdharFront(profileDto.getAdharFront());
        }
        if (profileDto.getAdharBack() != null) {
            user.setAdharBack(profileDto.getAdharBack());
        }

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    private UserProfileDto convertToDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .pincode(user.getPincode())
                .location(user.getLocation())
                .adharNumber(user.getAdharNumber())
                .adharFront(user.getAdharFront())
                .adharBack(user.getAdharBack())
                .build();
    }
}
