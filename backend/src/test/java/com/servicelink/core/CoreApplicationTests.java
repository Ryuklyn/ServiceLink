package com.servicelink.core;

import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class CoreApplicationTests {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ProviderRepository providerRepository;

	@Test
	void printUsersAndProviders() {
		System.out.println("=== PRINTING USERS ===");
		userRepository.findAll().forEach(user -> {
			System.out.println("User ID: " + user.getId() + ", Email: " + user.getEmail() + ", Role: " + user.getRole());
		});

		System.out.println("=== PRINTING PROVIDERS ===");
		providerRepository.findAll().forEach(provider -> {
			System.out.println("Provider ID: " + provider.getId() + ", User ID: " + (provider.getUser() != null ? provider.getUser().getId() : "null"));
		});
	}

}
