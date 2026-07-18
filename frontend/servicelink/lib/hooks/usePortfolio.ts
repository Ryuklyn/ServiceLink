import { useCallback, useEffect, useState } from "react";
import { normalizeError } from "@/utils/axios"; // ⚠️ adjust path to match portfolioApi.ts's axios import
import {
    fetchMyPortfolio,
    createPortfolioProject,
    deletePortfolioProject,
} from "@/lib/api/portfolioApi";
import type { PortfolioProject, PortfolioFormValues } from "@/types/portfolio";

/**
 * Local-state hook — deliberately not in Redux. This data only ever gets
 * read/written from the portfolio tab, so a store slice would just add
 * indirection without a real benefit.
 */
export function usePortfolio() {
    const [projects, setProjects] = useState<PortfolioProject[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchMyPortfolio();
            setProjects(data);
        } catch (err) {
            setError(normalizeError(err).message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const addProject = useCallback(async (values: PortfolioFormValues) => {
        setIsSaving(true);
        setError(null);
        try {
            const created = await createPortfolioProject(values);
            // Prepend rather than refetch — matches findByProviderIdOrderByCreatedAtDesc
            setProjects((prev) => [created, ...prev]);
            return true;
        } catch (err) {
            // Surfaces backend messages directly, e.g. "Maximum of 10 portfolio
            // projects allowed." or "Maximum of 5 photos allowed per project."
            setError(normalizeError(err).message);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const removeProject = useCallback(
        async (projectId: number) => {
            setError(null);
            const snapshot = projects;
            setProjects((prev) => prev.filter((p) => p.id !== projectId)); // optimistic
            try {
                await deletePortfolioProject(projectId);
                return true;
            } catch (err) {
                setProjects(snapshot); // roll back on failure
                setError(normalizeError(err).message);
                return false;
            }
        },
        [projects]
    );

    return {
        projects,
        isLoading,
        isSaving,
        error,
        reload: load,
        addProject,
        removeProject,
    };
}