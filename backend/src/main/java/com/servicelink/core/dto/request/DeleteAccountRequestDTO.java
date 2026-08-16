package com.servicelink.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteAccountRequestDTO {

    /** Omit/blank for OAuth (Google) users — they have no password to check. */
    private String currentPassword;

    @NotBlank(message = "Type DELETE to confirm")
    private String confirmationText;
}