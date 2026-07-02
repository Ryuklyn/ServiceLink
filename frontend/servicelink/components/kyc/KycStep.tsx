"use client";

import { ChangeEvent, ReactNode, useState } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Info,
    ShieldCheck,
    Upload,
    XCircle,
} from "lucide-react";
import { storageApi } from "@/lib/api/storageApi";

export type KYCFiles = {
    citizenshipFront: string | null;
    citizenshipBack: string | null;
    pan: string | null;
    professional: string[];
    photo: string | null;
};

interface Props {
    onNext?: (data: KYCFiles) => void;
    onBack?: () => void;
    initialData?: Partial<KYCFiles>;
    draftSessionId?: string | null;
}

type UploadBoxProps = {
    id: string;
    folder: string;
} & (
    | {
        file: string | null;
        onFile: (url: string) => void;
        multiple?: false;
    }
    | {
        file: string[];
        onFile: (url: string[]) => void;
        multiple: true;
    }
);

function UploadBox({ file, onFile, multiple = false, id, folder }: UploadBoxProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles?.length) return;

        setUploading(true);
        setUploadError("");

        try {
            if (multiple) {
                const results = await Promise.all(
                    Array.from(selectedFiles).map((selectedFile) => storageApi.uploadFile(selectedFile, folder)),
                );
                (onFile as (urls: string[]) => void)(results.map((result) => result.url));
            } else {
                const { url } = await storageApi.uploadFile(selectedFiles[0], folder);
                (onFile as (url: string) => void)(url);
            }
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : "Upload failed. Please try again.");
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    const isUploaded = Array.isArray(file) ? file.length > 0 : Boolean(file);
    const preview = Array.isArray(file) ? null : file;

    return (
        <label
            htmlFor={id}
            className={`block border-2 border-dashed rounded-2xl cursor-pointer mt-2 transition-all active:scale-[0.99]
        ${isUploaded ? "border-green-400 bg-green-50" : "border-stone-300 hover:border-stone-400 bg-stone-50"}`}
        >
            <div className="flex flex-col items-center justify-center py-8 sm:py-10 px-4 text-center">
                {preview ? (
                    <img src={preview} alt="preview" className="w-full max-h-36 sm:max-h-40 object-cover rounded-lg mb-3" />
                ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-200 mb-3">
                        <Upload className="w-5 h-5 text-stone-500" />
                    </div>
                )}

                <p className="text-sm font-medium text-stone-700">
                    {uploading ? "Uploading..." : isUploaded ? "Tap to replace" : "Tap to upload"}
                </p>
                {!isUploaded && <p className="text-xs text-stone-500 mt-1">JPG, PNG or PDF up to 5MB</p>}
                {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
            </div>

            <input
                id={id}
                type="file"
                className="hidden"
                multiple={multiple}
                accept="image/*,.pdf"
                onChange={handleChange}
            />
        </label>
    );
}

function KYCItem({
    title,
    required,
    file,
    children,
}: {
    title: string;
    required?: boolean;
    file: string | string[] | null;
    children: ReactNode;
}) {
    const isUploaded = Array.isArray(file) ? file.length > 0 : Boolean(file);

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center gap-2">
                <h3 className="font-semibold text-stone-800 text-sm sm:text-base">
                    {title} {required && "*"}
                </h3>
                <span className={`text-xs flex items-center gap-1 flex-shrink-0 ${isUploaded ? "text-green-600" : "text-red-500"}`}>
                    {isUploaded ? (
                        <>
                            <CheckCircle className="w-4 h-4" /> Uploaded
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4" /> Not uploaded
                        </>
                    )}
                </span>
            </div>
            {children}
        </div>
    );
}

function createInitialFiles(initialData?: Partial<KYCFiles>): KYCFiles {
    return {
        citizenshipFront: initialData?.citizenshipFront || null,
        citizenshipBack: initialData?.citizenshipBack || null,
        pan: initialData?.pan || null,
        professional: initialData?.professional || [],
        photo: initialData?.photo || null,
    };
}

export default function KYCStepRedesign({ onNext, onBack, initialData, draftSessionId }: Props) {
    const [files, setFiles] = useState<KYCFiles>(() => createInitialFiles(initialData));
    const uploadRoot = `kyc-drafts/${draftSessionId ?? "unsaved"}`;

    const update = <K extends keyof KYCFiles>(key: K, value: KYCFiles[K]) => {
        setFiles((prev) => ({ ...prev, [key]: value }));
    };

    const missingMandatory = [files.citizenshipFront, files.citizenshipBack, files.photo].filter((file) => !file).length;

    return (
        <div className="max-w-3xl mx-auto pb-24 sm:pb-0">
            <div className="text-center mb-6">
                <div className="inline-flex w-11 h-11 sm:w-12 sm:h-12 items-center justify-center bg-[#e8683f]/10 rounded-xl mb-3">
                    <ShieldCheck className="text-[#e8683f] w-5 h-5" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Identity Verification (KYC)</h1>
                <p className="text-xs sm:text-sm text-stone-500 px-2">
                    Required by law and for customer trust. All documents are encrypted and stored securely.
                </p>
            </div>

            <div className="bg-[#1e3a8a]/10 border border-[#1e3a8a]/20 text-[#1e3a8a] text-xs sm:text-sm p-3 rounded-lg mb-6 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Your documents are reviewed manually by our compliance team within 2-3 business days.
            </div>

            <h2 className="font-semibold text-stone-700 mb-3 text-sm sm:text-base">Mandatory Documents</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KYCItem title="Citizenship (Front)" required file={files.citizenshipFront}>
                    <UploadBox
                        id="citizenshipFront"
                        file={files.citizenshipFront}
                        onFile={(fileUrl) => update("citizenshipFront", fileUrl)}
                        folder={`${uploadRoot}/citizenship-front`}
                    />
                </KYCItem>

                <KYCItem title="Citizenship (Back)" required file={files.citizenshipBack}>
                    <UploadBox
                        id="citizenshipBack"
                        file={files.citizenshipBack}
                        onFile={(fileUrl) => update("citizenshipBack", fileUrl)}
                        folder={`${uploadRoot}/citizenship-back`}
                    />
                </KYCItem>
            </div>

            <KYCItem title="Passport Photo" required file={files.photo}>
                <UploadBox
                    id="photo"
                    file={files.photo}
                    onFile={(fileUrl) => update("photo", fileUrl)}
                    folder={`${uploadRoot}/photo`}
                />
            </KYCItem>

            <hr className="border-t border-stone-200 my-6" />

            <h2 className="font-semibold text-stone-700 mt-6 mb-3 text-sm sm:text-base">Optional Documents</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KYCItem title="PAN Card" file={files.pan}>
                    <UploadBox
                        id="pan"
                        file={files.pan}
                        onFile={(fileUrl) => update("pan", fileUrl)}
                        folder={`${uploadRoot}/pan`}
                    />
                </KYCItem>

                <KYCItem title="Professional Certificates" file={files.professional}>
                    <UploadBox
                        id="professional"
                        multiple
                        file={files.professional}
                        onFile={(fileUrls) => update("professional", fileUrls)}
                        folder={`${uploadRoot}/professional`}
                    />
                </KYCItem>
            </div>

            {missingMandatory > 0 && (
                <div className="mt-6 text-xs sm:text-sm text-red-500 flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {missingMandatory} mandatory document{missingMandatory > 1 ? "s" : ""} missing
                </div>
            )}

            <div
                className="
          fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-stone-100 p-4 flex gap-3
          sm:static sm:z-auto sm:bg-transparent sm:border-0 sm:p-0 sm:justify-between sm:mt-4
        "
            >
                <button
                    type="button"
                    onClick={onBack}
                    className="px-5 py-3 sm:py-2 border border-stone-200 rounded-lg flex items-center justify-center gap-2 text-sm text-stone-600 hover:bg-stone-50"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                    type="button"
                    disabled={missingMandatory > 0}
                    onClick={() => onNext?.(files)}
                    className="flex-1 sm:flex-none px-6 py-3 sm:py-2 bg-[#e8683f] text-white rounded-lg flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 active:scale-[0.98] transition"
                >
                    Next <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
