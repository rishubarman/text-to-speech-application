package com.example.tts.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class TtsService {

    public String generateSpeech(
            String text,
            String language,
            String voice
    ) throws IOException, InterruptedException {

        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text cannot be empty");
        }

        if (language == null || language.trim().isEmpty()) {
            throw new IllegalArgumentException("Language cannot be empty");
        }

        Path outputDirectory = Paths.get("audio");

        if (!Files.exists(outputDirectory)) {
            Files.createDirectories(outputDirectory);
        }

        String baseName = "speech-" + System.currentTimeMillis();

        Path aiffFile = outputDirectory.resolve(baseName + ".aiff");
        Path wavFile = outputDirectory.resolve(baseName + ".wav");

        String macVoice = getMacVoice(language);

        ProcessBuilder sayProcess = new ProcessBuilder(
                "/usr/bin/say",
                "-v",
                macVoice,
                "-o",
                aiffFile.toAbsolutePath().toString(),
                text
        );

        sayProcess.redirectErrorStream(true);

        Process process = sayProcess.start();

        String output = new String(
                process.getInputStream().readAllBytes(),
                StandardCharsets.UTF_8
        );

        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new IOException(
                    "macOS speech generation failed for voice "
                            + macVoice + ": " + output
            );
        }

        if (!Files.exists(aiffFile)) {
            throw new IOException(
                    "AIFF file was not created for voice: " + macVoice
            );
        }

        if (Files.size(aiffFile) == 0) {
            throw new IOException("Generated audio file is empty");
        }

        ProcessBuilder convertProcess = new ProcessBuilder(
                "/usr/bin/afconvert",
                "-f",
                "WAVE",
                "-d",
                "LEI16",
                aiffFile.toAbsolutePath().toString(),
                wavFile.toAbsolutePath().toString()
        );

        convertProcess.redirectErrorStream(true);

        Process conversion = convertProcess.start();

        String conversionOutput = new String(
                conversion.getInputStream().readAllBytes(),
                StandardCharsets.UTF_8
        );

        int conversionExitCode = conversion.waitFor();

        if (conversionExitCode != 0) {
            throw new IOException(
                    "Audio conversion failed: " + conversionOutput
            );
        }

        if (!Files.exists(wavFile)) {
            throw new IOException("WAV file was not created");
        }

        if (Files.size(wavFile) == 0) {
            throw new IOException("Converted audio file is empty");
        }

        Files.deleteIfExists(aiffFile);

        return wavFile.getFileName().toString();
    }

    private String getMacVoice(String language) {

        switch (language.trim().toLowerCase()) {

            case "english":
                return "Samantha";

            case "hindi":
                return "Lekha";

            case "spanish":
                return "Mónica";

            case "french":
                return "Jacques";

            case "german":
                return "Anna";

            case "italian":
                return "Alice";

            case "portuguese":
                return "Luciana";

            case "japanese":
                return "Kyoko";

            case "korean":
                return "Yuna";

            case "chinese":
                return "Tingting";

            case "arabic":
                return "Majed";

            case "russian":
                return "Milena";

            case "bengali":
                return "Piya";

            case "tamil":
                return "Vani";

            case "telugu":
                return "Geeta";

            case "kannada":
                return "Soumya";

            case "thai":
                return "Kanya";

            case "vietnamese":
                return "Linh";

            case "indonesian":
                return "Damayanti";

            case "turkish":
                return "Yelda";

            case "dutch":
                return "Xander";

            case "polish":
                return "Zosia";

            case "czech":
                return "Zuzana";

            case "ukrainian":
                return "Lesya";

            case "romanian":
                return "Ioana";

            case "greek":
                return "Melina";

            case "hebrew":
                return "Carmit";

            case "swedish":
                return "Alva";

            case "danish":
                return "Sara";

            case "finnish":
                return "Satu";

            case "norwegian":
                return "Nora";

            case "hungarian":
                return "Tünde";

            case "croatian":
                return "Lana";

            case "slovak":
                return "Laura";

            case "slovenian":
                return "Tina";

            case "lithuanian":
                return "Ona";

            case "catalan":
                return "Montse";

            case "kazakh":
                return "Aru";

            case "malay":
                return "Amira";

            default:
                throw new IllegalArgumentException(
                        "Unsupported language: " + language
                );
        }
    }
}