package com.bridge.placement.config;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApplicationStatusConstraintUpdater implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ApplicationStatusConstraintUpdater.class);

    private static final String DROP_CONSTRAINT_SQL = """
            ALTER TABLE applications
            DROP CONSTRAINT IF EXISTS applications_application_status_check
            """;

    private static final String ADD_CONSTRAINT_SQL = """
            ALTER TABLE applications
            ADD CONSTRAINT applications_application_status_check
            CHECK (application_status IN (
                'APPLIED',
                'SHORTLISTED',
                'INTERVIEW',
                'TECHNICAL_ROUND',
                'REJECTED',
                'SELECTED'
            ))
            """;

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute(DROP_CONSTRAINT_SQL);
            jdbcTemplate.execute(ADD_CONSTRAINT_SQL);
            log.info("Application status check constraint refreshed successfully.");
        } catch (Exception exception) {
            log.warn("Unable to refresh application status constraint automatically: {}", exception.getMessage());
        }
    }
}
