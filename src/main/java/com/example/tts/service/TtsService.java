package com.example.tts.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
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

        Path wavFile = outputDirectory.resolve(baseName + ".wav");

        // macOS (your local machine) -> built-in `say`; Linux (Render/Docker) -> espeak-ng
        boolean isMac = System.getProperty("os.name", "").toLowerCase().contains("mac");

        if (isMac) {
            generateWithMacSay(text, language, outputDirectory, baseName, wavFile);
        } else {
            generateWithEspeak(text, language, voice, wavFile);
        }

        return wavFile.getFileName().toString();
    }

    // ---------------- macOS: say + afconvert (original behaviour) ----------------

    private void generateWithMacSay(
            String text,
            String language,
            Path outputDirectory,
            String baseName,
            Path wavFile
    ) throws IOException, InterruptedException {

        Path aiffFile = outputDirectory.resolve(baseName + ".aiff");

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
    }

    // ---------------- Linux: espeak-ng ----------------

    private void generateWithEspeak(
            String text,
            String language,
            String voice,
            Path wavFile
    ) throws IOException, InterruptedException {

        String espeakVoice = getEspeakVoice(language);

        // "Daniel" is the UI's male English voice; everything else uses the female variant
        espeakVoice += "Daniel".equalsIgnoreCase(voice) ? "+m3" : "+f3";

        ProcessBuilder espeakProcess = new ProcessBuilder(
                "espeak-ng",
                "-v",
                espeakVoice,
                "-w",
                wavFile.toAbsolutePath().toString(),
                "--stdin"
        );

        espeakProcess.redirectErrorStream(true);

        Process process = espeakProcess.start();

        // Send the text through stdin as UTF-8 (command-line args can get mangled in Docker's default locale)
        try (OutputStream stdin = process.getOutputStream()) {
            stdin.write(text.getBytes(StandardCharsets.UTF_8));
        }

        String output = new String(
                process.getInputStream().readAllBytes(),
                StandardCharsets.UTF_8
        );

        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new IOException(
                    "Speech generation failed for voice "
                            + espeakVoice + ": " + output
            );
        }

        if (!Files.exists(wavFile)) {
            throw new IOException("WAV file was not created");
        }

        if (Files.size(wavFile) == 0) {
            throw new IOException("Generated audio file is empty");
        }
    }

    // ---------------- language -> voice lookups ----------------

    private String getMacVoice(String language) {

        switch (language.trim().toLowerCase()) {

            case "english": return "Samantha";
            case "hindi": return "Lekha";
            case "spanish": return "Mónica";
            case "french": return "Jacques";
            case "german": return "Anna";
            case "italian": return "Alice";
            case "portuguese": return "Luciana";
            case "japanese": return "Kyoko";
            case "korean": return "Yuna";
            case "chinese": return "Tingting";
            case "arabic": return "Majed";
            case "russian": return "Milena";
            case "bengali": return "Piya";
            case "tamil": return "Vani";
            case "telugu": return "Geeta";
            case "kannada": return "Soumya";
            case "thai": return "Kanya";
            case "vietnamese": return "Linh";
            case "indonesian": return "Damayanti";
            case "turkish": return "Yelda";
            case "dutch": return "Xander";
            case "polish": return "Zosia";
            case "czech": return "Zuzana";
            case "ukrainian": return "Lesya";
            case "romanian": return "Ioana";
            case "greek": return "Melina";
            case "hebrew": return "Carmit";
            case "swedish": return "Alva";
            case "danish": return "Sara";
            case "finnish": return "Satu";
            case "norwegian": return "Nora";
            case "hungarian": return "Tünde";
            case "croatian": return "Lana";
            case "slovak": return "Laura";
            case "slovenian": return "Tina";
            case "lithuanian": return "Ona";
            case "catalan": return "Montse";
            case "kazakh": return "Aru";
            case "malay": return "Amira";

            default:
                throw new IllegalArgumentException(
                        "Unsupported language: " + language
                );
        }
    }

    private String getEspeakVoice(String language) {

        switch (language.trim().toLowerCase()) {

            case "english": return "en-us";
            case "hindi": return "hi";
            case "spanish": return "es";
            case "french": return "fr-fr";
            case "german": return "de";
            case "italian": return "it";
            case "portuguese": return "pt-br";
            case "japanese": return "ja";
            case "korean": return "ko";
            case "chinese": return "cmn";
            case "arabic": return "ar";
            case "russian": return "ru";
            case "bengali": return "bn";
            case "tamil": return "ta";
            case "telugu": return "te";
            case "kannada": return "kn";
            case "thai": return "th";
            case "vietnamese": return "vi";
            case "indonesian": return "id";
            case "turkish": return "tr";
            case "dutch": return "nl";
            case "polish": return "pl";
            case "czech": return "cs";
            case "ukrainian": return "uk";
            case "romanian": return "ro";
            case "greek": return "el";
            case "hebrew": return "he";
            case "swedish": return "sv";
            case "danish": return "da";
            case "finnish": return "fi";
            case "norwegian": return "nb";
            case "hungarian": return "hu";
            case "croatian": return "hr";
            case "slovak": return "sk";
            case "slovenian": return "sl";
            case "lithuanian": return "lt";
            case "catalan": return "ca";
            case "kazakh": return "kk";
            case "malay": return "ms";

            default:
                throw new IllegalArgumentException(
                        "Unsupported language: " + language
                );
        }
    }
}