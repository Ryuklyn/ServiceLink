package com.servicelink.core.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class GoogleCalendarService {

    private static final String CALENDAR_ID = "primary"; // servicelink1607@gmail.com's own calendar

    // Reuses the SAME client id/secret your existing "Sign in with Google" flow uses —
    // matches whatever property path that config already reads from application.yml
    // (adjust the key below if your login setup uses a different path).
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    // This one IS new — calendar.events scope wasn't part of the login consent,
    // so it needs its own refresh token (see OAuth Playground steps from before).
    @Value("${google.calendar.refresh-token}")
    private String refreshToken;

    private Calendar buildClient() throws Exception {
        UserCredentials credentials = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(refreshToken)
                .build();

        HttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();

        return new Calendar.Builder(transport, GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("ServiceLink KYC")
                .build();
    }

    /** Creates a Calendar event with an auto-generated Meet link and invites the applicant. */
    public String createMeetEventAndGetLink(String applicantEmail, String applicantName,
                                            Instant start, Instant end) throws Exception {
        Calendar service = buildClient();

        Event event = new Event()
                .setSummary("ServiceLink KYC Video Verification — " + applicantName)
                .setDescription("KYC video verification call for " + applicantName + " via ServiceLink.")
                .setStart(new EventDateTime()
                        .setDateTime(new DateTime(start.toEpochMilli()))
                        .setTimeZone("Asia/Kathmandu"))
                .setEnd(new EventDateTime()
                        .setDateTime(new DateTime(end.toEpochMilli()))
                        .setTimeZone("Asia/Kathmandu"))
                .setAttendees(List.of(new EventAttendee().setEmail(applicantEmail)))
                .setConferenceData(new ConferenceData().setCreateRequest(
                        new CreateConferenceRequest()
                                .setRequestId(UUID.randomUUID().toString())
                                .setConferenceSolutionKey(new ConferenceSolutionKey().setType("hangoutsMeet"))
                ));

        Event created = service.events()
                .insert(CALENDAR_ID, event)
                .setConferenceDataVersion(1)
                .setSendUpdates("all") // applicant gets a native Google Calendar invite email too
                .execute();

        return created.getHangoutLink();
    }
}