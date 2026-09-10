package com.example.tts.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {

        Map<String, Object> response = new HashMap<>();

        response.put("success", true);
        response.put("status", "UP");
        response.put("message", "Text-to-Speech backend is running");

        return response;
    }
}