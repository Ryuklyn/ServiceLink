// utils/mapProviderServices.ts
import { ProviderServiceDTO } from "@/lib/api/providersApi"; // ya jaha define cha

export interface DisplayService {
    name: string;
    priceMin: number;
    priceMax: number;
    duration: string;
    category: string;
}

export function mapServicesForDisplay(
    services: ProviderServiceDTO[] | undefined,
): DisplayService[] {
    if (!services) return [];
    return services
        .filter((s) => s.isAvailable) // disabled service haru public view ma nadekhaune
        .map((s) => ({
            name: s.subServiceName,
            priceMin: s.customPrice,
            priceMax: s.customPrice, // single price ho, range hoina — same value dinu
            duration: s.effectiveDuration ?? "—",
            category: s.category,
        }));
}