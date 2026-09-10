package com.example.tts.repository;

import com.example.tts.model.SpeechHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpeechHistoryRepository extends JpaRepository<SpeechHistory, Long> {
}