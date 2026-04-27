"use client";

import { useState, ChangeEvent } from "react";
import {
  Upload,
  Camera,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";

/* =========================
   TYPES
========================= */
type KYCFiles = {
  citizenshipFront: File | null;
  citizenshipBack: File | null;
  pan: File | null;
  professional: File[];
  photo: File | null;
};

interface Props {
  onNext?: (data: KYCFiles) => void;
  onBack?: () => void;
}

/* =========================
   UPLOAD BOX
========================= */
function UploadBox({
  file,
  onFile,
  multiple = false,
  id,
}: {
  file: File | File[] | null;
  onFile: (file: any) => void;
  multiple?: boolean;
  id: string;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (multiple) {
      onFile(Array.from(files));
    } else {
      onFile(files[0]);
    }
  };

  const isUploaded = file && (Array.isArray(file) ? file.length > 0 : true);

  const preview =
    file && !Array.isArray(file) ? URL.createObjectURL(file) : null;

  return (
    <label
      htmlFor={id}
      className={`block border-2 border-dashed rounded-2xl cursor-pointer mt-2 transition-all
        ${
          isUploaded
            ? "border-green-400 bg-green-50"
            : "border-stone-300 hover:border-stone-400 bg-stone-50"
        }`}
    >
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="w-full max-h-40 object-cover rounded-lg mb-3"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-200 mb-3">
            <Upload className="w-5 h-5 text-stone-500" />
          </div>
        )}

        <p className="text-sm font-medium text-stone-700">
          {isUploaded ? "Click to replace" : "Click to upload"}
        </p>

        {!isUploaded && (
          <p className="text-xs text-stone-500 mt-1">JPG, PNG up to 5MB</p>
        )}
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

/* =========================
   ITEM ROW
========================= */
function KYCItem({ title, required, file, children }: any) {
  const isUploaded = file && (Array.isArray(file) ? file.length > 0 : true);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-stone-800">
          {title} {required && "*"}
        </h3>

        <span
          className={`text-xs flex items-center gap-1 ${
            isUploaded ? "text-green-600" : "text-red-500"
          }`}
        >
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

/* =========================
   MAIN COMPONENT
========================= */
export default function KYCStepRedesign({ onNext, onBack }: Props) {
  const [files, setFiles] = useState<KYCFiles>({
    citizenshipFront: null,
    citizenshipBack: null,
    pan: null,
    professional: [],
    photo: null,
  });

  const update = (key: keyof KYCFiles, value: any) => {
    setFiles((prev) => ({ ...prev, [key]: value }));
  };

  const missingMandatory = [
    files.citizenshipFront,
    files.citizenshipBack,
    files.photo,
  ].filter((f) => !f).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-6">
        <div className="inline-flex w-12 h-12 items-center justify-center bg-amber-50 rounded-xl mb-3">
          <ShieldCheck className="text-amber-500 w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          Identity Verification (KYC)
        </h1>
        <p className="text-sm text-stone-500">
          Required by law and for customer trust. All documents are encrypted
          and stored securely.
        </p>
      </div>

      {/* INFO */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm p-3 rounded-lg mb-6">
        <Info className="inline w-4 h-4 mr-1" />
        Your documents are reviewed manually by our compliance team within 2–3
        business days.
      </div>

      {/* MANDATORY */}
      <h2 className="font-semibold text-stone-700 mb-3">Mandatory Documents</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KYCItem
          title="Citizenship (Front)"
          required
          file={files.citizenshipFront}
        >
          <UploadBox
            id="citizenshipFront"
            file={files.citizenshipFront}
            onFile={(f) => update("citizenshipFront", f)}
          />
        </KYCItem>

        <KYCItem
          title="Citizenship (Back)"
          required
          file={files.citizenshipBack}
        >
          <UploadBox
            id="citizenshipBack"
            file={files.citizenshipBack}
            onFile={(f) => update("citizenshipBack", f)}
          />
        </KYCItem>
      </div>

      <KYCItem title="Passport Photo" required file={files.photo}>
        <UploadBox
          id="photo"
          file={files.photo}
          onFile={(f) => update("photo", f)}
        />
      </KYCItem>
      <hr className="border-t border-stone-300 my-6"></hr>

      {/* OPTIONAL */}
      <h2 className="font-semibold text-stone-700 mt-6 mb-3">
        Optional Documents
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KYCItem title="PAN Card" file={files.pan}>
          <UploadBox
            id="pan"
            file={files.pan}
            onFile={(f) => update("pan", f)}
          />
        </KYCItem>

        <KYCItem title="Professional Certificates" file={files.professional}>
          <UploadBox
            id="professional"
            multiple
            file={files.professional}
            onFile={(f) => update("professional", f)}
          />
        </KYCItem>
      </div>

      {/* FOOTER */}
      <div className="mt-6 text-sm text-red-500">
        Missing: {missingMandatory} mandatory documents
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2 border rounded-lg flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          disabled={missingMandatory > 0}
          onClick={() => onNext?.(files)}
          className="px-6 py-2 bg-amber-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
