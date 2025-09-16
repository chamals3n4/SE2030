package com.se2030.backend.service;

import com.se2030.backend.model.Client;
import com.se2030.backend.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public Client createClient(Client client) {
        if (client.getEmail() != null && clientRepository.findByEmail(client.getEmail()).isPresent()) {
            throw new RuntimeException("Client with email " + client.getEmail() + " already exists");
        }
        return clientRepository.save(client);
    }

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Optional<Client> getClientById(Long clientId) {
        return clientRepository.findById(clientId);
    }

    public Optional<Client> getClientByEmail(String email) {
        return clientRepository.findByEmail(email);
    }

    public Client updateClient(Long clientId, Client updatedClient) {
        return clientRepository.findById(clientId)
                .map(client -> {
                    client.setName(updatedClient.getName());
                    client.setEmail(updatedClient.getEmail());
                    client.setPhone(updatedClient.getPhone());
                    return clientRepository.save(client);
                })
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));
    }

    public void deleteClient(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new RuntimeException("Client not found with id: " + clientId);
        }
        clientRepository.deleteById(clientId);
    }

    public List<Client> searchClients(String search) {
        return clientRepository.searchByNameOrEmail(search);
    }
}