"use client";

import { Provider } from "react-redux";
import { store } from "@/store"; // matches your store/index.ts export

export default function Providers({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
}