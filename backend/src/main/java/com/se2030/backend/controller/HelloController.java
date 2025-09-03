package com.se2030.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/api")
    public String home(){
        return "HI";
    }

    @GetMapping("/api/hello")
    public String hello(){
        return "HI HI";
    }
}
