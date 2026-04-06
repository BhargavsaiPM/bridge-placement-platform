package com.bridge.placement.config;

import com.bridge.placement.entity.Admin;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.Job;
import com.bridge.placement.entity.JobRound;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.entity.User;
import com.bridge.placement.enums.CompanyType;
import com.bridge.placement.enums.IndustrySector;
import com.bridge.placement.enums.JobStatus;
import com.bridge.placement.enums.JobType;
import com.bridge.placement.enums.Role;
import com.bridge.placement.enums.RoundName;
import com.bridge.placement.enums.UserType;
import com.bridge.placement.enums.WorkMode;
import com.bridge.placement.repository.AdminRepository;
import com.bridge.placement.repository.CompanyRepository;
import com.bridge.placement.repository.JobRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import com.bridge.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.seed.enabled", havingValue = "true")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final String DEFAULT_COUNTRY = "India";
    private static final String COMPANY_PASSWORD = "Company@123";
    private static final String OFFICER_PASSWORD = "Officer@123";
    private static final String STUDENT_PASSWORD = "Student@123";
    private static final String WORKING_PASSWORD = "Working@123";

    private static final String[] IMAGE_URLS = {
            "https://placehold.co/600x600/png?text=Bridge+1",
            "https://placehold.co/600x600/png?text=Bridge+2",
            "https://placehold.co/600x600/png?text=Bridge+3",
            "https://placehold.co/600x600/png?text=Bridge+4",
            "https://placehold.co/600x600/png?text=Bridge+5",
            "https://placehold.co/600x600/png?text=Bridge+6"
    };

    private static final String[] PDF_URLS = {
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    };

    private final AdminRepository adminRepository;
    private final CompanyRepository companyRepository;
    private final PlacementOfficerRepository placementOfficerRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSuperAdmin();
        if (companyRepository.count() > 0 || placementOfficerRepository.count() > 0
                || userRepository.count() > 0 || jobRepository.count() > 0) {
            log.info("Existing database data detected, skipping demo data initialization.");
            return;
        }
        Map<String, Company> companies = seedCompanies();
        Map<String, PlacementOfficer> officers = seedOfficers(companies);
        seedJobs(companies, officers);
        seedStudents();
        seedWorkingProfessionals();
    }

    private void seedSuperAdmin() {
        String adminEmail = "admin@bridge.com";
        if (adminRepository.existsByEmail(adminEmail)) {
            log.info("Super Admin already exists, skipping.");
            return;
        }

        Admin admin = new Admin();
        admin.setEmail(adminEmail);
        admin.setName("Bridge Admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.SUPER_ADMIN);
        adminRepository.save(admin);

        log.info("Super Admin created -> {} / admin123", adminEmail);
    }

    private Map<String, Company> seedCompanies() {
        List<CompanySeed> companySeeds = List.of(
                new CompanySeed("NovaNest Technologies", "novanest", "careers@novanest.in", CompanyType.PRODUCT_BASED, IndustrySector.SOFTWARE, true, "Madhapur", "Hyderabad", "500081", "AI product engineering company focused on campus hiring and enterprise workflow tools."),
                new CompanySeed("AsterByte Systems", "asterbyte", "jobs@asterbyte.in", CompanyType.IT_SERVICES, IndustrySector.IT_SERVICES, true, "Whitefield", "Bengaluru", "560066", "Cloud modernization and platform services company serving BFSI and retail clients."),
                new CompanySeed("GreenForge Analytics", "greenforge", "talent@greenforge.in", CompanyType.STARTUP, IndustrySector.FINANCE, true, "Gachibowli", "Hyderabad", "500032", "Data analytics startup building forecasting and BI automation products for finance teams."),
                new CompanySeed("VertexLeap Health", "vertexleap", "hiring@vertexleap.in", CompanyType.PRODUCT_BASED, IndustrySector.HEALTHCARE, true, "Taramani", "Chennai", "600113", "Digital health platform creating patient workflows, telemedicine systems, and internal analytics dashboards."),
                new CompanySeed("MeridianStack Labs", "meridianstack", "people@meridianstack.in", CompanyType.MNC, IndustrySector.SOFTWARE, true, "Hinjewadi", "Pune", "411057", "Engineering lab for scalable SaaS applications, developer tooling, and cloud reliability solutions."),
                new CompanySeed("CloudCircuit Solutions", "cloudcircuit", "jobs@cloudcircuit.in", CompanyType.SERVICE_BASED, IndustrySector.IT_SERVICES, false, "Andheri East", "Mumbai", "400069", "Infrastructure consulting company currently awaiting admin approval before campus hiring starts."),
                new CompanySeed("BrightMesh Retail", "brightmesh", "careers@brightmesh.in", CompanyType.STARTUP, IndustrySector.RETAIL, false, "Sector 62", "Noida", "201309", "Retail commerce startup planning to expand its engineering and supply chain technology teams."),
                new CompanySeed("FinArc Capital Tech", "finarc", "recruit@finarc.in", CompanyType.FINANCE, IndustrySector.FINANCE, false, "Banjara Hills", "Hyderabad", "500034", "Fintech company building lending operations software and internal risk engines."),
                new CompanySeed("EduPulse Digital", "edupulse", "talent@edupulse.in", CompanyType.EDUCATION, IndustrySector.EDUCATION, false, "Kothaguda", "Hyderabad", "500084", "EdTech venture focused on assessment, student growth insights, and adaptive learning workflows."),
                new CompanySeed("IronGrid Manufacturing", "irongrid", "hr@irongrid.in", CompanyType.MANUFACTURING, IndustrySector.MANUFACTURING, false, "Peenya", "Bengaluru", "560058", "Smart manufacturing company digitizing operations across production, maintenance, and reporting.")
        );

        Map<String, Company> companiesBySlug = new LinkedHashMap<>();
        for (int index = 0; index < companySeeds.size(); index++) {
            CompanySeed seed = companySeeds.get(index);
            Company company = companyRepository.findByDomainEmail(seed.domainEmail()).orElseGet(Company::new);

            company.setName(seed.name());
            company.setDomainEmail(seed.domainEmail());
            company.setPassword(passwordEncoder.encode(COMPANY_PASSWORD));
            company.setBranchAddress(buildAddress(
                    "Block " + ((index % 3) + 1),
                    seed.area() + " Tech Park",
                    "Near Metro Corridor",
                    seed.city(),
                    seed.city(),
                    stateForCity(seed.city()),
                    seed.pincode(),
                    DEFAULT_COUNTRY));
            company.setDescription(seed.description());
            company.setProfilePhoto(IMAGE_URLS[index % IMAGE_URLS.length]);
            company.setCompanyType(seed.companyType());
            company.setIndustrySector(seed.industrySector());
            company.setApproved(seed.approved());
            company.setBlocked(false);
            company.setCreatedByAdmin(false);
            company.setProofDocumentUrl(PDF_URLS[index % PDF_URLS.length]);
            company.setRole(Role.COMPANY);
            company.setLastSeen(seed.approved() ? LocalDateTime.now().minusHours(index + 2L) : null);

            companiesBySlug.put(seed.slug(), companyRepository.save(company));
        }

        log.info("Seeded {} demo companies (5 approved, 5 pending).", companySeeds.size());
        return companiesBySlug;
    }

    private Map<String, PlacementOfficer> seedOfficers(Map<String, Company> companies) {
        List<OfficerSeed> officerSeeds = List.of(
                new OfficerSeed("Bodagala Nikitha", "bodagalanikitha", "novanest", "Management", "Placement Lead", 26, LocalDate.of(1999, 4, 12), "9876501101", "AB+", "8-65/2", "Tech Park Lane", "Near Inorbit Mall", "Tirupati", "Tirupati", "Andhra Pradesh", "517644", IMAGE_URLS[0], true),
                new OfficerSeed("Arjun Varma", "arjunvarma", "novanest", "Campus Relations", "Senior Placement Officer", 29, LocalDate.of(1996, 1, 22), "9876501102", "O+", "12-3/8", "Knowledge Avenue", "Opposite Sky Mall", "Hyderabad", "Hyderabad", "Telangana", "500081", IMAGE_URLS[1], true),
                new OfficerSeed("Sneha Patel", "snehapatel", "asterbyte", "Talent Operations", "Placement Coordinator", 28, LocalDate.of(1997, 6, 3), "9876501103", "A+", "44/7", "Innovation Road", "Phase 2", "Bengaluru", "Bengaluru Urban", "Karnataka", "560066", IMAGE_URLS[2], true),
                new OfficerSeed("Rohit Mehta", "rohitmehta", "vertexleap", "University Hiring", "Placement Officer", 30, LocalDate.of(1995, 9, 14), "9876501104", "B+", "21/4", "Prestige Street", "Near ITPL", "Bengaluru", "Bengaluru Urban", "Karnataka", "560066", IMAGE_URLS[3], true),
                new OfficerSeed("Divya Sharma", "divyasharma", "meridianstack", "People Success", "Hiring Specialist", 27, LocalDate.of(1998, 2, 8), "9876501105", "A-", "17-2/1", "Analytics Nagar", "Near Botanical Garden", "Hyderabad", "Hyderabad", "Telangana", "500032", IMAGE_URLS[4], true),
                new OfficerSeed("Karthik Rao", "karthikrao", "cloudcircuit", "Recruitment", "Placement Analyst", 31, LocalDate.of(1994, 12, 19), "9876501106", "B-", "9-11/5", "BI Street", "Financial District", "Mumbai", "Mumbai", "Maharashtra", "400069", IMAGE_URLS[5], false),
                new OfficerSeed("Meena Iyer", "meenaiyer", "brightmesh", "Clinical Hiring", "Placement Officer", 28, LocalDate.of(1997, 8, 25), "9876501107", "O-", "6/2", "Health Hub Road", "Near Tidel Park", "Noida", "Gautam Buddha Nagar", "Uttar Pradesh", "201309", IMAGE_URLS[1], false),
                new OfficerSeed("Sanjay Nair", "sanjaynair", "finarc", "Operations", "Campus Hiring Manager", 32, LocalDate.of(1993, 11, 4), "9876501108", "AB-", "45-B", "MedTech Street", "Phase 3", "Hyderabad", "Hyderabad", "Telangana", "500034", IMAGE_URLS[2], false),
                new OfficerSeed("Priyanka Kapoor", "priyankakapoor", "edupulse", "Talent Acquisition", "Lead Placement Officer", 29, LocalDate.of(1996, 3, 17), "9876501109", "O+", "304", "Cloud Residency", "Near Rajiv Gandhi Infotech Park", "Hyderabad", "Hyderabad", "Telangana", "500084", IMAGE_URLS[3], false),
                new OfficerSeed("Vikram Das", "vikramdas", "irongrid", "People & Culture", "Placement Officer", 30, LocalDate.of(1995, 5, 9), "9876501110", "A+", "20/6", "Stack Heights", "Blue Ridge", "Bengaluru", "Bengaluru Urban", "Karnataka", "560058", IMAGE_URLS[4], false)
        );

        Map<String, PlacementOfficer> officersByEmail = new LinkedHashMap<>();
        for (int index = 0; index < officerSeeds.size(); index++) {
            OfficerSeed seed = officerSeeds.get(index);
            Company company = companies.get(seed.companySlug());
            if (company == null) {
                continue;
            }

            String email = seed.emailLocal() + "@" + seed.companySlug() + ".in";
            PlacementOfficer officer = placementOfficerRepository.findByEmail(email).orElseGet(PlacementOfficer::new);

            officer.setName(seed.name());
            officer.setEmail(email);
            officer.setPassword(passwordEncoder.encode(OFFICER_PASSWORD));
            officer.setAge(seed.age());
            officer.setDateOfBirth(seed.dateOfBirth());
            officer.setMobileNumber(seed.mobileNumber());
            officer.setJobRole(seed.jobRole());
            officer.setWorkingSince(LocalDate.now().minusYears(2).minusMonths(index));
            officer.setDepartment(seed.department());
            officer.setBloodGroup(seed.bloodGroup());
            officer.setDoorNumber(seed.doorNumber());
            officer.setStreetName(seed.streetName());
            officer.setLandmark(seed.landmark());
            officer.setCity(seed.city());
            officer.setDistrict(seed.district());
            officer.setState(seed.state());
            officer.setPincode(seed.pincode());
            officer.setCountry(DEFAULT_COUNTRY);
            officer.setAddress(buildAddress(seed.doorNumber(), seed.streetName(), seed.landmark(), seed.city(), seed.district(), seed.state(), seed.pincode(), DEFAULT_COUNTRY));
            officer.setProfilePhoto(seed.profilePhoto());
            officer.setCompany(company);
            officer.setApproved(seed.approved());
            officer.setActive(true);
            officer.setRole(Role.PLACEMENT_OFFICER);
            officer.setRequiresPasswordChange(!seed.approved());
            officer.setLastSeen(seed.approved() ? LocalDateTime.now().minusHours(index + 1L) : null);

            officersByEmail.put(email, placementOfficerRepository.save(officer));
        }

        log.info("Seeded {} demo placement officers (5 approved, 5 pending).", officersByEmail.size());
        return officersByEmail;
    }

    private void seedJobs(Map<String, Company> companies, Map<String, PlacementOfficer> officers) {
        List<JobSeed> jobSeeds = List.of(
                new JobSeed("novanest", "Associate Frontend Engineer", "Build polished React interfaces for internal workflow tools and campus hiring dashboards.", "B.Tech or MCA with strong frontend fundamentals", "Project work in Tailwind, Framer Motion, or design systems is a plus", "React, JavaScript, CSS, REST APIs", "TypeScript, Figma, Performance Optimization", 0, "6.5 - 8.5 LPA", "Hyderabad", WorkMode.HYBRID, JobType.FULLTIME, List.of("bodagalanikitha@novanest.in"), List.of(RoundName.APTITUDE, RoundName.TECHNICAL, RoundName.HR)),
                new JobSeed("novanest", "Campus Recruitment Analyst", "Support hiring workflows, candidate tracking, and recruiter reporting for university engagement programs.", "Graduate degree with strong communication and Excel basics", "Prior internship in HR ops or analytics is preferred", "Excel, Communication, Problem Solving", "Power BI, Coordination, Stakeholder Management", 1, "4.8 - 6.2 LPA", "Hyderabad", WorkMode.ONSITE, JobType.FULLTIME, List.of("bodagalanikitha@novanest.in", "arjunvarma@novanest.in"), List.of(RoundName.APTITUDE, RoundName.HR)),
                new JobSeed("asterbyte", "Cloud Support Engineer", "Work with infrastructure teams to monitor services, automate checks, and support client delivery squads.", "B.Tech in CSE, IT, ECE or related streams", "AWS coursework or cloud internship exposure is preferred", "Linux, Networking, SQL, Communication", "AWS, Shell Scripting, Monitoring", 1, "5.5 - 7.0 LPA", "Bengaluru", WorkMode.ONSITE, JobType.FULLTIME, List.of("snehapatel@asterbyte.in"), List.of(RoundName.APTITUDE, RoundName.TECHNICAL, RoundName.HR)),
                new JobSeed("asterbyte", "Full Stack Intern", "Contribute to internal products across React UI, Java backend services, and QA-ready release flows.", "Strong DSA, OOP, and web fundamentals", "Open-source contributions or internship experience is preferred", "Java, Spring Boot, React, SQL", "Docker, Testing, Git", 0, "Stipend 28,000 / month", "Bengaluru", WorkMode.HYBRID, JobType.INTERNSHIP, List.of("snehapatel@asterbyte.in"), List.of(RoundName.APTITUDE, RoundName.TECHNICAL)),
                new JobSeed("vertexleap", "QA Automation Engineer", "Design automation suites and support quality workflows across patient and provider applications.", "Bachelor's degree with strong testing fundamentals", "Healthcare or product QA experience preferred", "Automation Testing, Selenium, Java, APIs", "Cypress, Postman, CI/CD", 2, "7.5 - 9.5 LPA", "Chennai", WorkMode.HYBRID, JobType.FULLTIME, List.of("rohitmehta@vertexleap.in"), List.of(RoundName.APTITUDE, RoundName.TECHNICAL, RoundName.HR)),
                new JobSeed("meridianstack", "Backend Engineer", "Build and maintain Java services, data pipelines, and API integrations for SaaS products.", "Strong Java and backend fundamentals with SQL knowledge", "Internship or project exposure to scalable systems preferred", "Java, Spring Boot, SQL, REST APIs", "Docker, Microservices, AWS", 2, "8.5 - 11.0 LPA", "Pune", WorkMode.HYBRID, JobType.FULLTIME, List.of("divyasharma@meridianstack.in"), List.of(RoundName.APTITUDE, RoundName.TECHNICAL, RoundName.HR))
        );

        for (int index = 0; index < jobSeeds.size(); index++) {
            JobSeed seed = jobSeeds.get(index);
            Company company = companies.get(seed.companySlug());
            if (company == null || !company.isApproved()) {
                continue;
            }

            Job job = jobRepository.findByCompanyId(company.getId()).stream()
                    .filter(existing -> seed.title().equalsIgnoreCase(existing.getTitle()))
                    .findFirst()
                    .orElseGet(Job::new);

            List<PlacementOfficer> assignedOfficers = seed.assignedOfficerEmails().stream()
                    .map(officers::get)
                    .filter(officer ->
                            officer != null
                                    && officer.getCompany().getId().equals(company.getId())
                                    && officer.isApproved()
                                    && officer.isActive())
                    .toList();

            job.setTitle(seed.title());
            job.setDescription(seed.description());
            job.setMinimumQualifications(seed.minimumQualifications());
            job.setPreferredQualifications(seed.preferredQualifications());
            job.setCompany(company);
            job.setRequiredSkills(seed.requiredSkills());
            job.setPreferredSkills(seed.preferredSkills());
            job.setExperienceRequired(seed.experienceRequired());
            job.setSalaryRange(seed.salaryRange());
            job.setLocation(seed.location());
            job.setWorkMode(seed.workMode());
            job.setJobType(seed.jobType());
            job.setApplicationDeadline(LocalDate.now().plusDays(20L + index));
            job.setMaxApplicants(120 + (index * 10));
            job.setBlockedByAdmin(false);
            job.setStatus(JobStatus.OPEN);
            job.setAssignedOfficers(new ArrayList<>(assignedOfficers));

            job.getRounds().clear();
            for (int roundIndex = 0; roundIndex < seed.rounds().size(); roundIndex++) {
                JobRound round = new JobRound();
                round.setJob(job);
                round.setRoundName(seed.rounds().get(roundIndex));
                round.setRoundOrder(roundIndex + 1);
                job.getRounds().add(round);
            }

            jobRepository.save(job);
        }

        log.info("Seeded demo jobs for approved companies with officer assignments.");
    }

    private void seedStudents() {
        List<StudentSeed> studentSeeds = List.of(
                new StudentSeed("Akhil", "Reddy", "akhil.reddy@studentmail.com", true, "9876602101", LocalDate.of(2002, 5, 14), "CMR Institute of Technology", "Hyderabad", "Hyderabad", "500081", "student.akhil@cmrit.ac.in", "Java, Spring Boot, SQL, React", "Built a campus placement dashboard and won 2nd prize in a state-level hackathon.", "Madhapur", "Hyderabad", "Telangana", "500081", "Lake View Street", "8-2/11", IMAGE_URLS[0], PDF_URLS[0]),
                new StudentSeed("Sravya", "Kumar", "sravya.kumar@studentmail.com", true, "9876602102", LocalDate.of(2003, 1, 9), "VNR VJIET", "Hyderabad", "Hyderabad", "500090", "student.sravya@vnrvjiet.ac.in", "Python, SQL, Power BI, Excel", "Completed a retail analytics project and led the college BI club.", "Nizampet", "Hyderabad", "Telangana", "500090", "Knowledge Street", "12-1/4", IMAGE_URLS[1], PDF_URLS[1]),
                new StudentSeed("Kiran", "Yadav", "kiran.yadav@studentmail.com", true, "9876602103", LocalDate.of(2002, 11, 3), "SASTRA University", "Thanjavur", "Thanjavur", "613401", "student.kiran@sastra.ac.in", "C++, Algorithms, Problem Solving, Git", "Solved 450+ coding problems and mentored juniors for aptitude preparation.", "West Main", "Thanjavur", "Tamil Nadu", "613401", "Temple Road", "7/15", IMAGE_URLS[2], PDF_URLS[2]),
                new StudentSeed("Nandini", "Shah", "nandini.shah@studentmail.com", true, "9876602104", LocalDate.of(2003, 8, 27), "MIT WPU", "Pune", "Pune", "411038", "student.nandini@mitwpu.edu.in", "UI/UX, Figma, React, Communication", "Designed a volunteer management app and interned as a product design associate.", "Kothrud", "Pune", "Maharashtra", "411038", "Design Avenue", "4-B", IMAGE_URLS[3], PDF_URLS[3]),
                new StudentSeed("Harsha", "Nair", "harsha.nair@studentmail.com", true, "9876602105", LocalDate.of(2002, 7, 18), "SRM University", "Chennai", "Chennai", "603203", "student.harsha@srmist.edu.in", "Testing, Selenium, Java, APIs", "Completed an end-to-end QA internship and built reusable test suites for a mini ERP.", "Potheri", "Chennai", "Tamil Nadu", "603203", "SRM Main Road", "11-8", IMAGE_URLS[4], PDF_URLS[4]),
                new StudentSeed("Varun", "Kiran", "varun.kiran@studentmail.com", false, "9876602106", LocalDate.of(2003, 4, 2), "KL University", "Vijayawada", "Krishna", "522302", "student.varun@kluniversity.in", "Java, SQL, OOP", "Pending student profile waiting for admin approval.", "Poranki", "Vijayawada", "Andhra Pradesh", "522302", "Riverfront Lane", "3-9/2", IMAGE_URLS[5], PDF_URLS[5]),
                new StudentSeed("Tejaswini", "Rao", "tejaswini.rao@studentmail.com", false, "9876602107", LocalDate.of(2002, 9, 30), "JNTU Kakinada", "Kakinada", "East Godavari", "533003", "student.tejaswini@jntuk.edu.in", "Python, Data Analysis", "Pending student profile waiting for admin approval.", "Sarpavaram", "Kakinada", "Andhra Pradesh", "533003", "Canal Road", "9-6/1", IMAGE_URLS[0], PDF_URLS[6]),
                new StudentSeed("Rahul", "Mishra", "rahul.mishra@studentmail.com", false, "9876602108", LocalDate.of(2003, 2, 16), "Amity University", "Noida", "Gautam Buddha Nagar", "201301", "student.rahul@amity.edu.in", "React, HTML, CSS", "Pending student profile waiting for admin approval.", "Sector 125", "Noida", "Uttar Pradesh", "201301", "Knowledge Park", "18/4", IMAGE_URLS[1], PDF_URLS[0]),
                new StudentSeed("Pooja", "Singh", "pooja.singh@studentmail.com", false, "9876602109", LocalDate.of(2002, 12, 22), "NIT Warangal", "Warangal", "Hanamkonda", "506004", "student.pooja@nitw.ac.in", "DSA, C++, SQL", "Pending student profile waiting for admin approval.", "Kazipet", "Warangal", "Telangana", "506004", "Hostel Road", "2-1/6", IMAGE_URLS[2], PDF_URLS[1]),
                new StudentSeed("Imran", "Ali", "imran.ali@studentmail.com", false, "9876602110", LocalDate.of(2003, 6, 11), "PES University", "Bengaluru", "Bengaluru Urban", "560085", "student.imran@pes.edu", "DevOps, Linux, Networking", "Pending student profile waiting for admin approval.", "Banashankari", "Bengaluru", "Karnataka", "560085", "Campus Link Road", "5-14", IMAGE_URLS[3], PDF_URLS[2])
        );

        studentSeeds.forEach(this::upsertStudent);
        log.info("Seeded {} demo students (5 approved, 5 pending).", studentSeeds.size());
    }

    private void seedWorkingProfessionals() {
        List<WorkingSeed> workingSeeds = List.of(
                new WorkingSeed("Aditya", "Menon", "aditya.menon@workmail.com", true, "9876703101", LocalDate.of(1999, 10, 7), "NovaNest Technologies", "novanest.aditya@company.in", "NT-1001", "Software Engineer", "Java, Spring Boot, Microservices, SQL", "Built internal APIs for recruitment workflow automation.", "Madhapur", "Hyderabad", "Telangana", "500081", "Orbit Street", "9-3/1", IMAGE_URLS[4], PDF_URLS[3]),
                new WorkingSeed("Kavya", "Joshi", "kavya.joshi@workmail.com", true, "9876703102", LocalDate.of(1998, 3, 19), "AsterByte Systems", "asterbyte.kavya@company.in", "AS-2044", "Cloud Analyst", "AWS, Linux, Monitoring, Excel", "Delivered deployment monitoring dashboards for client operations.", "Marathahalli", "Bengaluru", "Karnataka", "560037", "Outer Ring Road", "12-6", IMAGE_URLS[5], PDF_URLS[4]),
                new WorkingSeed("Ritesh", "Jain", "ritesh.jain@workmail.com", true, "9876703103", LocalDate.of(1997, 7, 27), "GreenForge Analytics", "greenforge.ritesh@company.in", "GF-3010", "BI Developer", "SQL, Power BI, Python, Excel", "Owned executive dashboards and automated monthly reporting.", "Kondapur", "Hyderabad", "Telangana", "500084", "Data Colony", "18/2", IMAGE_URLS[0], PDF_URLS[5]),
                new WorkingSeed("Lavanya", "Shetty", "lavanya.shetty@workmail.com", true, "9876703104", LocalDate.of(1996, 12, 5), "VertexLeap Health", "vertexleap.lavanya@company.in", "VH-4411", "QA Engineer", "Selenium, Java, APIs, Testing", "Handled end-to-end test execution for healthcare provider modules.", "Velachery", "Chennai", "Tamil Nadu", "600042", "Med Street", "22-A", IMAGE_URLS[1], PDF_URLS[6]),
                new WorkingSeed("Siddharth", "Kulkarni", "siddharth.kulkarni@workmail.com", true, "9876703105", LocalDate.of(1998, 9, 2), "MeridianStack Labs", "meridian.siddharth@company.in", "MS-5521", "Backend Developer", "Java, Docker, REST APIs, AWS", "Built internal APIs and service monitoring hooks for release pipelines.", "Wakad", "Pune", "Maharashtra", "411057", "Stack Boulevard", "6-9", IMAGE_URLS[2], PDF_URLS[0]),
                new WorkingSeed("Neha", "Agarwal", "neha.agarwal@workmail.com", false, "9876703106", LocalDate.of(1997, 4, 11), "CloudCircuit Solutions", "cloudcircuit.neha@company.in", "CC-6101", "Operations Associate", "Excel, Communication, Coordination", "Pending working profile waiting for admin approval.", "Andheri East", "Mumbai", "Maharashtra", "400069", "Phoenix Lane", "7/2", IMAGE_URLS[3], PDF_URLS[1]),
                new WorkingSeed("Tarun", "Gupta", "tarun.gupta@workmail.com", false, "9876703107", LocalDate.of(1996, 6, 21), "BrightMesh Retail", "brightmesh.tarun@company.in", "BR-7208", "Support Engineer", "SQL, Support, APIs", "Pending working profile waiting for admin approval.", "Sector 62", "Noida", "Uttar Pradesh", "201309", "Retail Hub Road", "14-3", IMAGE_URLS[4], PDF_URLS[2]),
                new WorkingSeed("Mounika", "Devi", "mounika.devi@workmail.com", false, "9876703108", LocalDate.of(1999, 1, 15), "FinArc Capital Tech", "finarc.mounika@company.in", "FA-8301", "Analyst", "Excel, SQL, Data Analysis", "Pending working profile waiting for admin approval.", "Somajiguda", "Hyderabad", "Telangana", "500082", "Capital Road", "9-1", IMAGE_URLS[5], PDF_URLS[3]),
                new WorkingSeed("Abhishek", "Pillai", "abhishek.pillai@workmail.com", false, "9876703109", LocalDate.of(1998, 11, 9), "EduPulse Digital", "edupulse.abhishek@company.in", "ED-9022", "Product Associate", "Communication, Research, Figma", "Pending working profile waiting for admin approval.", "Kondapur", "Hyderabad", "Telangana", "500084", "Learning Street", "10-5", IMAGE_URLS[0], PDF_URLS[4]),
                new WorkingSeed("Rekha", "Patnaik", "rekha.patnaik@workmail.com", false, "9876703110", LocalDate.of(1997, 8, 28), "IronGrid Manufacturing", "irongrid.rekha@company.in", "IG-7719", "Production Planner", "Excel, Coordination, Reporting", "Pending working profile waiting for admin approval.", "Peenya", "Bengaluru", "Karnataka", "560058", "Factory Main Road", "3-18", IMAGE_URLS[1], PDF_URLS[5])
        );

        workingSeeds.forEach(this::upsertWorkingProfessional);
        log.info("Seeded {} demo working professionals (5 approved, 5 pending).", workingSeeds.size());
    }

    private void upsertStudent(StudentSeed seed) {
        User user = userRepository.findByEmail(seed.email()).orElseGet(User::new);

        user.setFirstName(seed.firstName());
        user.setLastName(seed.lastName());
        user.setEmail(seed.email());
        user.setPassword(passwordEncoder.encode(STUDENT_PASSWORD));
        user.setMobile(seed.mobile());
        user.setDob(seed.dob());
        user.setRoleType(UserType.STUDENT);
        user.setRole(Role.USER);
        user.setCollegeRollNumber("STU-" + seed.mobile().substring(seed.mobile().length() - 4));
        user.setCollegeMailId(seed.collegeMailId());
        user.setCollegeName(seed.collegeName());
        user.setCollegeCity(seed.collegeCity());
        user.setCollegeDistrict(seed.collegeDistrict());
        user.setCollegeCountry(DEFAULT_COUNTRY);
        user.setCollegePincode(seed.collegePincode());
        user.setStudentIdCardUrl(seed.profilePhoto());
        user.setHighestQualification("B.Tech");
        user.setCgpa(7.2 + ((extractLastDigits(seed.mobile()) % 16) / 10.0));
        user.setSpecialization(inferSpecialization(seed.skills()));
        user.setPassingYear(LocalDate.now().getYear());
        user.setExperienceYears(0);
        user.setCountry(DEFAULT_COUNTRY);
        user.setState(seed.state());
        user.setDistrict(seed.district());
        user.setPincode(seed.pincode());
        user.setCity(seed.city());
        user.setStreet(seed.street());
        user.setDoorNumber(seed.doorNumber());
        user.setProfilePhoto(seed.profilePhoto());
        user.setResumeUrl(seed.resumeUrl());
        user.setSkills(seed.skills());
        user.setAchievements(seed.achievements());
        user.setApproved(seed.approved());
        user.setBlocked(false);
        user.setLastSeen(seed.approved() ? LocalDateTime.now().minusDays(extractLastDigits(seed.mobile()) % 5L) : null);

        userRepository.save(user);
    }

    private void upsertWorkingProfessional(WorkingSeed seed) {
        User user = userRepository.findByEmail(seed.email()).orElseGet(User::new);

        user.setFirstName(seed.firstName());
        user.setLastName(seed.lastName());
        user.setEmail(seed.email());
        user.setPassword(passwordEncoder.encode(WORKING_PASSWORD));
        user.setMobile(seed.mobile());
        user.setDob(seed.dob());
        user.setRoleType(UserType.WORKING);
        user.setRole(Role.USER);
        user.setEmployeeId(seed.employeeId());
        user.setCompanyMailId(seed.companyMailId());
        user.setCompanyName(seed.companyName());
        user.setCompanyCity(seed.city());
        user.setCompanyDistrict(seed.district());
        user.setCompanyCountry(DEFAULT_COUNTRY);
        user.setCompanyPincode(seed.pincode());
        user.setCurrentPosition(seed.currentPosition());
        user.setEmployeeIdCardUrl(seed.profilePhoto());
        user.setHighestQualification("B.Tech");
        user.setCgpa(6.8 + ((extractLastDigits(seed.mobile()) % 18) / 10.0));
        user.setSpecialization(inferSpecialization(seed.skills()));
        user.setPassingYear(LocalDate.now().minusYears(Math.max(2, estimateExperience(seed.dob()))).getYear());
        user.setExperienceYears(estimateExperience(seed.dob()));
        user.setCountry(DEFAULT_COUNTRY);
        user.setState(seed.state());
        user.setDistrict(seed.district());
        user.setPincode(seed.pincode());
        user.setCity(seed.city());
        user.setStreet(seed.street());
        user.setDoorNumber(seed.doorNumber());
        user.setProfilePhoto(seed.profilePhoto());
        user.setResumeUrl(seed.resumeUrl());
        user.setSkills(seed.skills());
        user.setAchievements(seed.achievements());
        user.setApproved(seed.approved());
        user.setBlocked(false);
        user.setLastSeen(seed.approved() ? LocalDateTime.now().minusDays(extractLastDigits(seed.mobile()) % 5L) : null);

        userRepository.save(user);
    }

    private long extractLastDigits(String mobile) {
        return Long.parseLong(mobile.substring(mobile.length() - 2));
    }

    private int estimateExperience(LocalDate dob) {
        return Math.max(1, java.time.Period.between(dob, LocalDate.now()).getYears() - 22);
    }

    private String inferSpecialization(String skills) {
        String lowerSkills = skills == null ? "" : skills.toLowerCase();
        if (lowerSkills.contains("react") || lowerSkills.contains("java") || lowerSkills.contains("sql")
                || lowerSkills.contains("devops") || lowerSkills.contains("spring boot")) {
            return "Computer Science";
        }
        if (lowerSkills.contains("power bi") || lowerSkills.contains("excel") || lowerSkills.contains("tableau")) {
            return "Information Technology";
        }
        if (lowerSkills.contains("selenium") || lowerSkills.contains("testing") || lowerSkills.contains("apis")) {
            return "Electronics and Communication";
        }
        if (lowerSkills.contains("figma") || lowerSkills.contains("ui/ux")) {
            return "Design";
        }
        return "Computer Science";
    }

    private String buildAddress(String... parts) {
        return Stream.of(parts)
                .filter(part -> part != null && !part.isBlank())
                .collect(Collectors.joining(", "));
    }

    private String stateForCity(String city) {
        return switch (city) {
            case "Hyderabad", "Warangal" -> "Telangana";
            case "Bengaluru" -> "Karnataka";
            case "Chennai", "Thanjavur" -> "Tamil Nadu";
            case "Pune", "Mumbai" -> "Maharashtra";
            case "Noida" -> "Uttar Pradesh";
            default -> "Andhra Pradesh";
        };
    }

    private record CompanySeed(
            String name,
            String slug,
            String domainEmail,
            CompanyType companyType,
            IndustrySector industrySector,
            boolean approved,
            String area,
            String city,
            String pincode,
            String description
    ) {}

    private record OfficerSeed(
            String name,
            String emailLocal,
            String companySlug,
            String department,
            String jobRole,
            Integer age,
            LocalDate dateOfBirth,
            String mobileNumber,
            String bloodGroup,
            String doorNumber,
            String streetName,
            String landmark,
            String city,
            String district,
            String state,
            String pincode,
            String profilePhoto,
            boolean approved
    ) {}

    private record JobSeed(
            String companySlug,
            String title,
            String description,
            String minimumQualifications,
            String preferredQualifications,
            String requiredSkills,
            String preferredSkills,
            Integer experienceRequired,
            String salaryRange,
            String location,
            WorkMode workMode,
            JobType jobType,
            List<String> assignedOfficerEmails,
            List<RoundName> rounds
    ) {}

    private record StudentSeed(
            String firstName,
            String lastName,
            String email,
            boolean approved,
            String mobile,
            LocalDate dob,
            String collegeName,
            String collegeCity,
            String collegeDistrict,
            String collegePincode,
            String collegeMailId,
            String skills,
            String achievements,
            String city,
            String district,
            String state,
            String pincode,
            String street,
            String doorNumber,
            String profilePhoto,
            String resumeUrl
    ) {}

    private record WorkingSeed(
            String firstName,
            String lastName,
            String email,
            boolean approved,
            String mobile,
            LocalDate dob,
            String companyName,
            String companyMailId,
            String employeeId,
            String currentPosition,
            String skills,
            String achievements,
            String city,
            String district,
            String state,
            String pincode,
            String street,
            String doorNumber,
            String profilePhoto,
            String resumeUrl
    ) {}
}
