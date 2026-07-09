import { SubscriptionPlanType } from "@/lib/api/subscriptionApi";

export function getPlanBadgeLabel(planType: SubscriptionPlanType | undefined): string {
    switch (planType) {
        case "FREE_TRIAL": return "Free Trial";
        case "MONTHLY": return "Monthly";
        case "QUARTERLY": return "Quarterly";
        case "YEARLY": return "Yearly";
        default: return "—";
    }
}

export function getPlanBadgeLabelUpper(planType: SubscriptionPlanType | undefined): string {
    switch (planType) {
        case "FREE_TRIAL": return "FREE TRIAL";
        case "MONTHLY": return "MONTHLY PLAN";
        case "QUARTERLY": return "QUARTERLY PLAN";
        case "YEARLY": return "YEARLY PLAN";
        default: return "NO PLAN";
    }
}