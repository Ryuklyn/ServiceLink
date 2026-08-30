package com.servicelink.core.dto.response.provider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderEarningsResponseDTO {

    private Summary summary;
    private List<RevenueTrendItem> revenueTrend;
    private List<TopServiceItem> topServices;
    private List<PaymentItem> recentPayments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long totalEarned;
        private Integer completedJobs;
        private Double averagePerJob;
        private Long pendingAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueTrendItem {
        private String month;
        private Long amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopServiceItem {
        private String name;
        private Long value;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentItem {
        private String id;
        private String customer;
        private String service;
        private String date;
        private String amount;
        private String status;
    }
}
