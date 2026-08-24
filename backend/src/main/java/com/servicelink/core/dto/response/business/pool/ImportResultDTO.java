package com.servicelink.core.dto.response.business.pool;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ImportResultDTO {
    private int added;
    private int skipped;    // already in the pool
    private int notFound;   // phone/email didn't match an existing ServiceLink provider
}