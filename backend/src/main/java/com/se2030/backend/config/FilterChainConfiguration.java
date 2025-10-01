package com.se2030.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class FilterChainConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.cors()
            .and()
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers(
                    "/api/public/**",         
                    "/v3/api-docs/**",        
                    "/v3/api-docs.yaml",      
                    "/swagger-ui/**",          
                    "/swagger-ui.html"       
                ).permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer()
            .jwt();

        return http.build();
    }
}
