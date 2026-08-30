import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { translations } from "@/utils/translations";

export function useTranslation() {
    const pathname = usePathname() || "";
    const isProvider = pathname.startsWith("/dashboard/provider");

    const userLanguage = useAppSelector((state) => state.userPreferences?.language || "en");
    const providerLanguage = useAppSelector((state) => state.providerPreferences?.language || "en");

    const language = isProvider ? providerLanguage : userLanguage;

    const t = (key: string, fallback?: string): string => {
        const dict = translations[language] || translations["en"];
        
        // 1. Resolve nested path (e.g., "navigation.home")
        if (key.includes(".")) {
            const parts = key.split(".");
            let current: any = dict;
            for (const part of parts) {
                if (current == null) break;
                current = current[part];
            }
            if (typeof current === "string") return current;
        }

        // 2. Check flat lookup (for backward compatibility / default routes matching)
        // Check standard categories/mappings from flat lookup
        if (dict[key] != null && typeof dict[key] === "string") {
            return dict[key];
        }

        // Check inside nested domains for the key as a fallback
        for (const domain in dict) {
            if (typeof dict[domain] === "object" && dict[domain][key] != null) {
                return dict[domain][key];
            }
        }

        return fallback ?? key;
    };

    return { t, language };
}
