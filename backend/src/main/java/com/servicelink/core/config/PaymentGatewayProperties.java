package com.servicelink.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties (prefix = "payment")
public class PaymentGatewayProperties {

    private Esewa esewa = new Esewa();
    private Khalti khalti = new Khalti();

    @Data
    public static class Esewa{
        private String merchantCode;
        private String baseUrl;
        private String verifyUrl;
        private String secretKey;

    }

    @Data
    public static class Khalti{
        private String secretKey;
        private String baseUrl;
        private String verifyUrl;
        private String websiteUrl;
    }
}
