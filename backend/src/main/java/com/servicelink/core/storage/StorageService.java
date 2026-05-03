package com.servicelink.core.storage;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class StorageService {

    private static final String BASE_DIR = "uploads";

    public String upload(MultipartFile file, String folder) throws IOException {
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        Path folderPath = Paths.get(BASE_DIR, folder);
        Files.createDirectories(folderPath);

        Path filePath = folderPath.resolve(fileName);
        Files.write(filePath, file.getBytes());

        return filePath.toString(); // store this in DB
    }

    public String getFileUrl(String path) {
        return "http://localhost:8080/" + path.replace("\\", "/");
    }
}