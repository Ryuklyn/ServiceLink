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
public class ProviderAnalyticsResponseDTO {

    private Summary summary;
    private List<TrendItem> bookingTrend;
    private List<CategoryItem> serviceCategories;
    private List<List<Integer>> peakHours; // 7x11 grid matrix
    private Ratings ratings;
    private List<CoverageItem> coverage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Integer totalBookings;
        private Double acceptanceRate;
        private Double repeatCustomerRate;
        private Double averageResponseTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendItem {
        private String label;
        private Integer value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryItem {
        private String name;
        private Double value;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Ratings {
        private Double average;
        private Integer totalReviews;
        private List<RatingItem> distribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingItem {
        private Integer star;
        private Double pct;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverageItem {
        private Double lat;
        private Double lng;
        private String label;
    }
}
