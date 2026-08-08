package com.servicelink.core.repository.provider.service;

import com.servicelink.core.model.provider.service.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByIsActiveTrueOrderByNameAsc();

    List<Category> findAllByOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);
}