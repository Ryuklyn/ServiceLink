import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ── localStorage helpers ────────────────────────────────────────────────────
const STORAGE_KEY = "kyc_draft";
const STORAGE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

function saveToBrowser(data: object) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            data,
            savedAt: Date.now(),
            expiresAt: Date.now() + STORAGE_TTL,
        }));
    } catch (e) {
        console.warn("localStorage save failed:", e);
    }
}

function loadFromBrowser(): any | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);

        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return parsed.data;
    } catch (e) {
        return null;
    }
}

function clearFromBrowser() {
    localStorage.removeItem(STORAGE_KEY);
}

// ── Types ───────────────────────────────────────────────────────────────────
export interface KycAddress {
    province: string;
    district: string;
    municipality: string;
    ward: string;
    tole: string;
}

export interface KycPersonalData {
    fullName: string;
    dob: string;
    gender: string;
    phone: string;
    email: string;
    currentAddress: KycAddress;
    permanentAddress: KycAddress;
    sameAddress: boolean;
}

export interface KycProfessionalData {
    primaryService: string;
    otherService: string;
    additionalServices: string[];
    experienceYears: number;
    primaryDistrict: string;
    secondaryDistricts: string[];
    travelRadius: string;
    bio: string;
    image: string | null;
    photoConfirmed: boolean;
}

export interface KycState {
    currentStep: number;
    personal: Partial<KycPersonalData>;
    professional: Partial<KycProfessionalData>;
    draftLoaded: boolean;
    draftSessionId: string | null;
    referenceNumber: string | null; // ← NEW
}

const initialState: KycState = {
    currentStep: 1,
    personal: {},
    professional: {},
    draftLoaded: false,
    draftSessionId: null,
    referenceNumber: null, // ← NEW
};

// ── Slice ───────────────────────────────────────────────────────────────────
const kycSlice = createSlice({
    name: "kyc",
    initialState,
    reducers: {

        loadDraftFromBrowser(state) {
            const saved = loadFromBrowser();
            if (saved) {
                state.personal = saved.personal ?? {};
                state.professional = saved.professional ?? {};
                state.currentStep = saved.currentStep ?? 1;
                state.draftSessionId = saved.draftSessionId ?? null;
                state.referenceNumber = saved.referenceNumber ?? null; // ← NEW
            }

            if (!state.draftSessionId) {
                state.draftSessionId = crypto.randomUUID();
            }

            state.draftLoaded = true;
        },

        setStep(state, action: PayloadAction<number>) {
            state.currentStep = action.payload;
            saveToBrowser({
                personal: state.personal,
                professional: state.professional,
                currentStep: action.payload,
                draftSessionId: state.draftSessionId,
                referenceNumber: state.referenceNumber, // ← NEW
            });
        },

        savePersonalStep(state, action: PayloadAction<KycPersonalData>) {
            state.personal = action.payload;
            saveToBrowser({
                personal: action.payload,
                professional: state.professional,
                currentStep: state.currentStep,
                draftSessionId: state.draftSessionId,
                referenceNumber: state.referenceNumber, // ← NEW
            });
        },

        saveProfessionalStep(state, action: PayloadAction<KycProfessionalData>) {
            state.professional = action.payload;
            saveToBrowser({
                personal: state.personal,
                professional: action.payload,
                currentStep: state.currentStep,
                draftSessionId: state.draftSessionId,
                referenceNumber: state.referenceNumber, // ← NEW
            });
        },

        // ← NEW: call this the moment the submit API call succeeds
        setSubmitResponse(state, action: PayloadAction<{ referenceNumber: string }>) {
            state.referenceNumber = action.payload.referenceNumber;
            saveToBrowser({
                personal: state.personal,
                professional: state.professional,
                currentStep: state.currentStep,
                draftSessionId: state.draftSessionId,
                referenceNumber: action.payload.referenceNumber,
            });
        },

        // Submit success ya reset ma clear garne
        resetKyc() {
            clearFromBrowser();
            return { ...initialState, draftLoaded: true };
        },
    },
});

export const {
    loadDraftFromBrowser,
    setStep,
    savePersonalStep,
    saveProfessionalStep,
    setSubmitResponse, // ← NEW
    resetKyc,
} = kycSlice.actions;

export default kycSlice.reducer;