package com.bridge.placement.repository;

import com.bridge.placement.entity.LoginLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {

    List<LoginLog> findAllByOrderByLoginTimeDesc();

    List<LoginLog> findByEmailOrderByLoginTimeDesc(String email);
}
