package com.se2030.backend.repository;

import com.se2030.backend.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByEmail(String email);

    List<Client> findByNameContainingIgnoreCase(String name);

    Optional<Client> findByPhone(String phone);

    @Query("SELECT c FROM Client c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Client> searchByNameOrEmail(@Param("search") String search);
}