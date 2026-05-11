package com.linkwise.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS Configuration for LinkWise Backend
 * 
 * Configures Cross-Origin Resource Sharing to allow requests from the frontend
 * and other allowed origins.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // Allow requests from frontend (development)
                .allowedOrigins(
                        "http://localhost",           // Frontend (no port)
                        "http://127.0.0.1",           // Frontend (no port, 127.0.0.1)
                        "http://localhost:3000",      // Frontend dev server
                        "http://127.0.0.1:3000",      // Frontend dev server (127.0.0.1)
                        "http://localhost:8080",      // Backend direct access (Swagger UI)
                        "http://127.0.0.1:8080",      // Backend direct access
                        "http://linkwise-frontend-dev:3000",  // Docker container
                        "http://linkwise-nginx-dev:3000",     // Nginx proxy
                        "http://linkwise-nginx-dev:8080",     // Nginx backend proxy
                        "http://linkwise-backend-dev:8080"    // Backend container
                )
                // Allow common HTTP methods
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                // Allow all headers
                .allowedHeaders("*")
                // Allow credentials (cookies, authorization headers)
                .allowCredentials(true)
                // Maximum time (in seconds) the results of a preflight request can be cached
                .maxAge(3600);

        // Additional mapping for API endpoints specifically
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost",
                        "http://127.0.0.1",
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "http://localhost:8080",
                        "http://127.0.0.1:8080",
                        "http://linkwise-frontend-dev:3000",
                        "http://linkwise-nginx-dev:3000",
                        "http://linkwise-nginx-dev:8080",
                        "http://linkwise-backend-dev:8080"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
