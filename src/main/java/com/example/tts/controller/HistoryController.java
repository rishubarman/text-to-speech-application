package com.example.tts.controller;

import com.example.tts.model.SpeechHistory;
import com.example.tts.repository.SpeechHistoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "http://localhost:5173")
public class HistoryController {

    private final SpeechHistoryRepository repository;

    public HistoryController(SpeechHistoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<SpeechHistory> getHistory() {
        return repository.findAll();
    }

    @DeleteMapping("/{id}")
    public String deleteHistory(@PathVariable Long id) {

        if (!repository.existsById(id)) {
            return "History record not found";
        }

        repository.deleteById(id);

        return "History record deleted successfully";
    }
}