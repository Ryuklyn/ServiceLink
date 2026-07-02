"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import KycPage from "@/components/kyc/KycPage";

export default function ProviderRegisterPage() {
    return (
        <Provider store={store}>
            <KycPage />
        </Provider>
    );
}