package com.servicelink.core.dto.response.admin.subscription;

import lombok.Builder;
import lombok.Value;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Matches the frontend's PagedResult<T> exactly (page is 0-indexed on both
 * sides already, since Spring Data's Page is 0-indexed by default).
 */
@Value
@Builder
public class PagedResponseDTO<T> {
    List<T> content;
    int page;
    int size;
    long totalElements;
    int totalPages;

    public static <T> PagedResponseDTO<T> from(Page<T> springPage) {
        return PagedResponseDTO.<T>builder()
                .content(springPage.getContent())
                .page(springPage.getNumber())
                .size(springPage.getSize())
                .totalElements(springPage.getTotalElements())
                .totalPages(springPage.getTotalPages())
                .build();
    }
}