"use client";

import { useState, useRef } from "react";
import { X, Loader2, Camera } from "lucide-react";
import { updateMyProfile, updateMyPhoto } from "@/lib/api/authApi";

interface EditProfileModalProps {
    currentName: string;
    currentImage: string | null;
    onClose: () => void;
    onSaved: (data: { fullName: string; profileImage: string | null }) => void;
}

export default function EditProfileModal({
                                             currentName,
                                             currentImage,
                                             onClose,
                                             onSaved,
                                         }: EditProfileModalProps) {
    const [fullName, setFullName] = useState(currentName);
    const [previewImage, setPreviewImage] = useState<string | null>(currentImage);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        setError(null);
        if (!fullName.trim()) {
            setError("Full name cannot be empty");
            return;
        }
        try {
            setLoading(true);

            let finalImage = currentImage;

            if (selectedFile) {
                const photoResult = await updateMyPhoto(selectedFile);
                finalImage = photoResult.profileImage;
            }

            const nameResult = await updateMyProfile(fullName.trim());

            onSaved({
                fullName: nameResult.fullName || fullName.trim(),
                profileImage: finalImage,
            });
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to save changes");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) =>
        name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={18} />
                </button>

                <h3 className="text-lg font-bold text-gray-900 mb-5">Edit Profile</h3>

                {/* Avatar with upload */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-[#0a337a] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span>{getInitials(fullName)}</span>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#e8683f] hover:bg-[#d45b34] border-2 border-white flex items-center justify-center text-white"
                        >
                            <Camera size={14} fill="currentColor" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Full Name */}
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Full Name
                </label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                />

                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full mt-5 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-sm font-bold hover:bg-[#1e3a8a]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    Save Changes
                </button>
            </div>
        </div>
    );
}