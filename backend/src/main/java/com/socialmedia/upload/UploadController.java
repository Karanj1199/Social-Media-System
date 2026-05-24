package com.socialmedia.upload;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        String originalFilename =
                StringUtils.cleanPath(file.getOriginalFilename());

        String extension = "";

        int dotIndex = originalFilename.lastIndexOf('.');

        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String filename =
                UUID.randomUUID() + extension;

        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Files.copy(
                file.getInputStream(),
                uploadPath.resolve(filename),
                StandardCopyOption.REPLACE_EXISTING
        );

        return ResponseEntity.ok("/uploads/" + filename);
    }
}