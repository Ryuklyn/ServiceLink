
package com.servicelink.core.service;

import java.security.SecureRandom;

import org.springframework.stereotype.Service;

@Service
public class OtpService {
    private static final int OTP_LENGTH = 6;
    
    private SecureRandom random = new SecureRandom();

    public String generateOtp(){
         int otp = random.nextInt(900000) + 100000;
        return String.valueOf(otp);
    }


    public boolean validateOtp(String inputOtp, String actualOtp) {
        return inputOtp.equals(actualOtp);
    }
}
