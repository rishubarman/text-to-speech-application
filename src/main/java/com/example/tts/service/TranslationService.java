package com.example.tts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class TranslationService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public TranslationService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public String translate(
            String text,
            String language
    ) throws Exception {

        String targetLanguage = getLanguageCode(language);

        String encodedText = URLEncoder.encode(
                text,
                StandardCharsets.UTF_8
        );

        String langPair = "en|" + targetLanguage;

        String encodedLangPair = URLEncoder.encode(
                langPair,
                StandardCharsets.UTF_8
        );

        String url =
                "https://api.mymemory.translated.net/get"
                        + "?q=" + encodedText
                        + "&langpair=" + encodedLangPair;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        HttpResponse<String> response =
                httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString()
                );

        if (response.statusCode() != 200) {
            throw new RuntimeException(
                    "Translation API failed: "
                            + response.statusCode()
            );
        }

        JsonNode root =
                objectMapper.readTree(response.body());

        JsonNode translated =
                root.path("responseData")
                        .path("translatedText");

        if (translated.isMissingNode() ||
                translated.asText().isBlank()) {

            throw new RuntimeException(
                    "Translation failed"
            );
        }

        return translated.asText();
    }

    private String getLanguageCode(String language) {

        switch (language.toLowerCase()) {

            case "hindi":
                return "hi";

            case "spanish":
                return "es";

            case "french":
                return "fr";

            case "german":
                return "de";

            case "italian":
                return "it";

            case "portuguese":
                return "pt";

            case "japanese":
                return "ja";

            case "korean":
                return "ko";

            case "chinese":
                return "zh";

            case "arabic":
                return "ar";

            case "russian":
                return "ru";

            case "bengali":
                return "bn";

            case "tamil":
                return "ta";

            case "telugu":
                return "te";

            case "kannada":
                return "kn";

            case "thai":
                return "th";

            case "vietnamese":
                return "vi";

            case "indonesian":
                return "id";

            case "turkish":
                return "tr";

            case "dutch":
                return "nl";

            case "polish":
                return "pl";

            case "czech":
                return "cs";

            case "ukrainian":
                return "uk";

            case "romanian":
                return "ro";

            case "greek":
                return "el";

            case "hebrew":
                return "he";

            case "swedish":
                return "sv";

            case "danish":
                return "da";

            case "finnish":
                return "fi";

            case "norwegian":
                return "no";

            case "hungarian":
                return "hu";

            case "croatian":
                return "hr";

            case "slovak":
                return "sk";

            case "slovenian":
                return "sl";

            case "lithuanian":
                return "lt";

            case "catalan":
                return "ca";

            case "kazakh":
                return "kk";

            case "malay":
                return "ms";

            default:
                throw new IllegalArgumentException(
                        "Unsupported language: " + language
                );
        }
    }
}