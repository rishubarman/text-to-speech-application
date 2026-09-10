package com.example.tts.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/audio")
@CrossOrigin(origins = "http://localhost:5173")
public class AudioController {

    private final Path audioDirectory =
            Paths.get("audio").toAbsolutePath().normalize();

    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> getAudio(
            @PathVariable String fileName) {

        try {

            Path filePath = audioDirectory
                    .resolve(fileName)
                    .normalize();

            if (!filePath.startsWith(audioDirectory)) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(
                    filePath.toUri()
            );

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + fileName + "\""
                    )
                    .body(resource);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }
}