package com.example.tts.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class VoiceController {

    @GetMapping("/voices")
    public Map<String, List<Map<String, String>>> getVoices() {

        List<Map<String, String>> voices = List.of(
                Map.of(
                        "id", "en-US-female",
                        "name", "English Female",
                        "language", "en-US"
                ),
                Map.of(
                        "id", "en-US-male",
                        "name", "English Male",
                        "language", "en-US"
                ),
                Map.of(
                        "id", "hi-IN-female",
                        "name", "Hindi Female",
                        "language", "hi-IN"
                )
        );

        return Map.of("voices", voices);
    }
}