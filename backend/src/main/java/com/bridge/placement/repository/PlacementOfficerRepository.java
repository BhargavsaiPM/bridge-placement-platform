package com.bridge.placement.repository;

import com.bridge.placement.entity.PlacementOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlacementOfficerRepository extends JpaRepository<PlacementOfficer, Long> {
    Optional<PlacementOfficer> findByEmail(String email);

    boolean existsByEmail(String email);

    List<PlacementOfficer> findByCompanyId(Long companyId);
}
