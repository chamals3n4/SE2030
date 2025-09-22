package com.se2030.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @GetMapping("/health")
    public String health() {
        return "hi hi";
    }

    @GetMapping("/sus")
    public String info() {
        return "crus eka missing :(";
    }
}