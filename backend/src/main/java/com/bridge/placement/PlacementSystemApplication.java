package com.bridge.placement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PlacementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlacementSystemApplication.class, args);
    }

}
