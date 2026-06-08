//package com.servicelink.core.config;
//
//import com.servicelink.core.model.user.User;
//import com.servicelink.core.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Component;
//
//import javax.management.relation.Role;
//
//@Component
//@RequiredArgsConstructor
//public class AdminInitializer implements CommandLineRunner {
//
//    private final UserRepository userRepository;
//    private final PasswordEncoder passwordEncoder;
//
//    @Override
//    public void run(String... args) {
//
//        if (userRepository.existsByEmail(("admin@servicelink.com")) {
//            return;
//        }
//
//        User admin = User.builder()
//                .email("admin@servicelink.com")
//                .password(passwordEncoder.encode("Rukesh@1607"))
//                .role(Role.ADMIN)
//                .enabled(true)
//                .build();
//
//        userRepository.save(admin);
//
//        System.out.println("Default admin created");
//    }
//}


package com.servicelink.core.config;

import com.servicelink.core.model.auth.AuthProvider;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Prevent duplicate seeding if admin already exists
        if (userRepository.existsByEmail("admin@servicelink.com")) {
            return;
        }

        User admin = User.builder()
                .fullName("System Administrator")
                .email("admin@servicelink.com")
                .password(passwordEncoder.encode("Rukesh@1607"))
                .provider(AuthProvider.LOCAL) // Assuming LOCAL is your standard password provider
                .role(Role.ADMIN)
                .verified(true)
                .build();

        userRepository.save(admin);
        System.out.println(">> ServiceLink: Default admin account successfully seeded.");
    }
}