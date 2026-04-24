
package com.servicelink.core.service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

// @Service
// public class OtpService {
//     private static final int OTP_LENGTH = 6;
    
//     private SecureRandom random = new SecureRandom();

//     public String generateOtp(){
//          int otp = random.nextInt(900000) + 100000;
//         return String.valueOf(otp);
//     }


//     public boolean validateOtp(String inputOtp, String actualOtp) {
//         return inputOtp.equals(actualOtp);
//     }
// }

@Service
public class OtpService {

    private final Map<String, String> otpStorage = new HashMap<>();

    public String generateOtp(String email) {
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);
        otpStorage.put(email, otp);
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        return otp.equals(otpStorage.get(email));
    }

    public void clearOtp(String email) {
        otpStorage.remove(email);
    }
}
