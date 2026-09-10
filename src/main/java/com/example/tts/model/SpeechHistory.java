package com.example.tts.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "speech_history")
public class SpeechHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private String voice;

    private String audioUrl;

    private LocalDateTime createdAt;

    public SpeechHistory() {
    }

    public SpeechHistory(
            String text,
            String language,
            String voice,
            String audioUrl
    ) {
        this.text = text;
        this.language = language;
        this.voice = voice;
        this.audioUrl = audioUrl;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getVoice() {
        return voice;
    }

    public void setVoice(String voice) {
        this.voice = voice;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}