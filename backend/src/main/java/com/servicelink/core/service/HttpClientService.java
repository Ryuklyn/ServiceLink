package com.servicelink.core.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Thin wrapper around Java's built-in HttpClient so we have a
 * Spring-managed bean that's easy to mock in tests.
 */
@Service
public class HttpClientService {

    private static final Logger log = LoggerFactory.getLogger(HttpClientService.class);

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public String get(String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            log.error("HTTP GET {} returned status {}: {}", url, response.statusCode(), response.body());
            throw new RuntimeException("External request failed with status " + response.statusCode());
        }
        return response.body();
    }
}
