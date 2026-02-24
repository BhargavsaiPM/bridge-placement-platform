package com.bridge.placement.repository;

import com.bridge.placement.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByDomainEmail(String domainEmail);

    boolean existsByDomainEmail(String domainEmail);

    java.util.List<Company> findByApproved(boolean approved);

    long countByApproved(boolean approved);
}
