import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Plain useDispatch/useSelector को साटो यिनै use गर्ने
// ताकि TypeScript ले automatically types थाहा पाओस्
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;