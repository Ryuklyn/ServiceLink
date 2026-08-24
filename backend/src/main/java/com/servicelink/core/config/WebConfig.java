package com.servicelink.core.config;

import com.servicelink.core.security.CurrentOrganizationArgumentResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final CurrentOrganizationArgumentResolver currentOrganizationArgumentResolver;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(currentOrganizationArgumentResolver);
    }
}
