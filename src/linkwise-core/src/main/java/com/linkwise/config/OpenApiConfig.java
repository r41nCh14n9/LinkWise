package com.linkwise.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI Configuration for Swagger UI
 * 
 * Configures the OpenAPI documentation with correct server URLs
 * for development environment.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LinkWise API")
                        .version("1.0.0")
                        .description("LinkWise Backend API Documentation"))
                .addServersItem(new Server()
                        .url("http://localhost:8080")
                        .description("Development Environment"))
                .addServersItem(new Server()
                        .url("http://127.0.0.1:8080")
                        .description("Development Environment (127.0.0.1)"))
                .addServersItem(new Server()
                        .url("http://localhost:3000")
                        .description("Frontend Development Environment"));
    }
}
