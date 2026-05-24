package com.example.SmartProp.repository;

import com.example.SmartProp.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, String> {
    Optional<Tenant> findByFirstNameAndLastName(String firstName, String lastName);
}
