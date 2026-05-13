package com.linkwise.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security Configuration
 * Configures Spring Security components
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    /**
     * Configure password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configure security filter chain - allow public access to development endpoints
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().and()
            .authorizeHttpRequests(authz -> authz
                // Allow public access to specific endpoints for development
                .requestMatchers(
                    "/api/v1/auth/**",
                    "/api/v1/admin/**",
                    "/api/v1/users/**",
                    "/api/v1/roles/**",
                    "/api/v1/departments/**",
                    "/api/v1/permissions/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/actuator/**"
                ).permitAll()
                // Require authentication for all other endpoints
                .anyRequest().authenticated()
            )
            .httpBasic();
        
        return http.build();
    }
}
