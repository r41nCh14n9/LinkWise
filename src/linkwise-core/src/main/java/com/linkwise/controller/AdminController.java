package com.linkwise.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin Controller - Utility endpoints for administration
 * NOTE: These endpoints should be protected in production
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Generate BCrypt password hash
     * Development endpoint only - remove in production
     */
    @PostMapping("/encode-password")
    public ResponseEntity<Map<String, String>> encodePassword(@RequestParam String password) {
        String hash = passwordEncoder.encode(password);
        Map<String, String> response = new HashMap<>();
        response.put("password", password);
        response.put("hash", hash);
        log.info("Generated hash for password");
        return ResponseEntity.ok(response);
    }

    /**
     * Test password verification
     * Development endpoint only - remove in production
     */
    @PostMapping("/verify-password")
    public ResponseEntity<Map<String, Object>> verifyPassword(
            @RequestParam String password,
            @RequestParam String hash) {
        boolean matches = passwordEncoder.matches(password, hash);
        Map<String, Object> response = new HashMap<>();
        response.put("password", password);
        response.put("hash", hash);
        response.put("matches", matches);
        return ResponseEntity.ok(response);
    }
}
