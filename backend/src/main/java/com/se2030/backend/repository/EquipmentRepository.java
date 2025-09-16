package com.se2030.backend.repository;

import com.se2030.backend.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByEquipmentType(String equipmentType);
}


