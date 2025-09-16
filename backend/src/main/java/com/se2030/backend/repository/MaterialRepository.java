package com.se2030.backend.repository;

import com.se2030.backend.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByUnitOfMeasure(String unitOfMeasure);
}


