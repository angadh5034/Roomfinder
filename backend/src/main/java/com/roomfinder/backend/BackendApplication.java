package com.roomfinder.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner databaseSchemaUpdater(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE rental_requests MODIFY COLUMN adhar_front LONGTEXT");
                jdbcTemplate.execute("ALTER TABLE rental_requests MODIFY COLUMN adhar_back LONGTEXT");
                jdbcTemplate.execute("ALTER TABLE rental_requests MODIFY COLUMN tenant_id BIGINT NULL");

                jdbcTemplate.execute("ALTER TABLE room_renters MODIFY COLUMN adhar_front LONGTEXT");
                jdbcTemplate.execute("ALTER TABLE room_renters MODIFY COLUMN adhar_back LONGTEXT");

                try {
                    jdbcTemplate.execute("ALTER TABLE room_renters DROP COLUMN name, DROP COLUMN contact, DROP COLUMN rent_from, DROP COLUMN rent_to");
                    System.out.println(">>> [BackendApplication] Dropped legacy duplicate columns (name, contact, rent_from, rent_to) from room_renters table.");
                } catch (Exception ex) {
                    System.out.println(">>> [BackendApplication] Notice dropping legacy columns: " + ex.getMessage());
                }

                System.out.println(">>> [BackendApplication] MySQL schema updated successfully for rental_requests and room_renters.");
            } catch (Exception e) {
                System.out.println(">>> [BackendApplication] MySQL schema update notice: " + e.getMessage());
            }
        };
    }
}
