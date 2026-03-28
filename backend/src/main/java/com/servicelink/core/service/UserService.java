package com.servicelink.core.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.servicelink.core.model.User;
import com.servicelink.core.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }

    public User save(User user) {
        return repo.save(user);
    }

    public User update(Long id, User user) {
        return repo.findById(id)
            .map(existing -> {
                existing.setName(user.getName());
                existing.setEmail(user.getEmail());
                return repo.save(existing);
            })
            .orElseThrow(() -> new IllegalArgumentException("User not found with id " + id));
    }
    
    public void deleteById(Long id) {
        repo.deleteById(id);
    }
}
