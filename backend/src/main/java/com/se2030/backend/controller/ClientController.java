package com.se2030.backend.controller;

import com.se2030.backend.model.Client;
import com.se2030.backend.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @PostMapping
    public ResponseEntity<Client> createClient(@Valid @RequestBody Client client) {
        try {
            Client savedClient = clientService.createClient(client);
            return new ResponseEntity<>(savedClient, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() {
        List<Client> clients = clientService.getAllClients();
        return new ResponseEntity<>(clients, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable("id") Long clientId) {
        Optional<Client> client = clientService.getClientById(clientId);
        return client.map(c -> new ResponseEntity<>(c, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable("id") Long clientId,
                                               @Valid @RequestBody Client client) {
        try {
            Client updatedClient = clientService.updateClient(clientId, client);
            return new ResponseEntity<>(updatedClient, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteClient(@PathVariable("id") Long clientId) {
        try {
            clientService.deleteClient(clientId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Client>> searchClients(@RequestParam("q") String search) {
        List<Client> clients = clientService.searchClients(search);
        return new ResponseEntity<>(clients, HttpStatus.OK);
    }
}