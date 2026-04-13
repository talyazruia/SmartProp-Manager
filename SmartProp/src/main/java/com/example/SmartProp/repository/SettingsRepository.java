package com.example.SmartProp.repository;

import com.example.SmartProp.model.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends JpaRepository<SystemSettings, String> {
}
