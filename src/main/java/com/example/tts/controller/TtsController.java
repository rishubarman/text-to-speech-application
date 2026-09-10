package com.example.tts.controller;

import com.example.tts.dto.TtsRequest;
import com.example.tts.model.SpeechHistory;
import com.example.tts.repository.SpeechHistoryRepository;
import com.example.tts.service.TranslationService;
import com.example.tts.service.TtsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tts")
@CrossOrigin(origins = "http://localhost:5173")
public class TtsController {

    private final TtsService ttsService;
    private final TranslationService translationService;
    private final SpeechHistoryRepository speechHistoryRepository;

    public TtsController(
            TtsService ttsService,
            TranslationService translationService,
            SpeechHistoryRepository speechHistoryRepository) {

        this.ttsService = ttsService;
        this.translationService = translationService;
        this.speechHistoryRepository = speechHistoryRepository;
    }

    @PostMapping
    public ResponseEntity<?> generateSpeech(
            @RequestBody TtsRequest request) {

        try {

            if (request.getText() == null ||
                    request.getText().trim().isEmpty()) {

                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Text cannot be empty.");

                return ResponseEntity.badRequest().body(error);
            }

            if (request.getText().length() > 500) {

                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Text cannot exceed 500 characters.");

                return ResponseEntity.badRequest().body(error);
            }

            if (request.getLanguage() == null ||
                    request.getLanguage().trim().isEmpty()) {

                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Language must be selected.");

                return ResponseEntity.badRequest().body(error);
            }

            if (request.getVoice() == null ||
                    request.getVoice().trim().isEmpty()) {

                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Voice must be selected.");

                return ResponseEntity.badRequest().body(error);
            }

            String translatedText;

            if (request.getLanguage().equalsIgnoreCase("English")) {
                translatedText = request.getText();
            } else {
                translatedText = translationService.translate(
                        request.getText(),
                        request.getLanguage()
                );
            }

            String fileName = ttsService.generateSpeech(
                    translatedText,
                    request.getLanguage(),
                    request.getVoice()
            );

            SpeechHistory history = new SpeechHistory();

            history.setText(request.getText());
            history.setLanguage(request.getLanguage());
            history.setVoice(request.getVoice());
            history.setAudioUrl(fileName);
            history.setCreatedAt(LocalDateTime.now());

            speechHistoryRepository.save(history);

            Map<String, Object> response = new HashMap<>();

            response.put("success", true);
            response.put("originalText", request.getText());
            response.put("translatedText", translatedText);
            response.put("audioUrl", fileName);
            response.put("language", request.getLanguage());
            response.put("voice", request.getVoice());

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            Map<String, Object> error = new HashMap<>();

            error.put("success", false);
            error.put(
                    "message",
                    "Speech generation failed: " + e.getMessage()
            );

            return ResponseEntity
                    .internalServerError()
                    .body(error);
        }
    }
}