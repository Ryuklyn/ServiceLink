package com.servicelink.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    

//     @Override
//     protected void doFilterInternal(
//             @NonNull HttpServletRequest request,
//             @NonNull HttpServletResponse response,
//             @NonNull FilterChain filterChain
//     ) throws ServletException, IOException {
//         final String authHeader = request.getHeader("Authorization");
//         final String jwt;
//         final String userEmail;
        
//         if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//             filterChain.doFilter(request, response);
//             return;
//         }
        
//         if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
//             filterChain.doFilter(request, response);
//             return;
// }
//         jwt = authHeader.substring(7);
//         try {
//             userEmail = jwtService.extractUsername(jwt);
            
//             if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//                 if (jwtService.isTokenValid(jwt, userEmail)) {
//                     UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
//                             userEmail,
//                             null,
//                            new ArrayList<>()
//                     );
//                     authToken.setDetails(
//                             new WebAuthenticationDetailsSource().buildDetails(request)
//                     );
//                     SecurityContextHolder.getContext().setAuthentication(authToken);
//                     System.out.println("AUTH HEADER: " + authHeader);
//                     System.out.println("EXTRACTED EMAIL: " + userEmail);
//                     System.out.println("JWT: " + jwt);
//                     System.out.println("Extracting username...");
//                 }
//             }
//         } catch (Exception e) {
//              e.printStackTrace();
//              System.out.println("JWT: " + jwt);
//             System.out.println("Extracting username...");
//         }
        
//         filterChain.doFilter(request, response);
//     }
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtService.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                if (jwtService.isTokenValid(token, email)) {

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    new ArrayList<>()
                            );

                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }

        } catch (Exception e) {
            System.out.println("JWT ERROR: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
