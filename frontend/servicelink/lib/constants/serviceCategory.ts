export const SERVICE_OPTIONS = [
    {
        value: "electrical",
        label: "Electrical Work",
        backend: "ELECTRICIAN",
    },
    {
        value: "plumbing",
        label: "Plumbing & Pipe Work",
        backend: "PLUMBER",
    },
    {
        value: "carpentry",
        label: "Carpentry & Woodwork",
        backend: "CARPENTER",
    },
    {
        value: "painting",
        label: "Painting & Decorating",
        backend: "PAINTER",
    },
    {
        value: "cleaning",
        label: "House Cleaning",
        backend: "CLEANER",
    },
    {
        value: "acRepair",
        label: "AC Repair",
        backend: "AC_REPAIR",
    },
] as const;

export function toBackendServiceCategory(
    value?: string
): string | undefined {
    return SERVICE_OPTIONS.find(s => s.value === value)?.backend;
}

export function getServiceLabel(value: string): string {
    return (
        SERVICE_OPTIONS.find(
            s => s.value === value || s.backend === value
        )?.label ?? value
    );
}