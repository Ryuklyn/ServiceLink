"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Eye, Upload } from "lucide-react";

interface AvatarMenuProps {
    currentImage: string | null;
    onUploadClick: () => void;
}

export default function AvatarMenu({ currentImage, onUploadClick }: AvatarMenuProps) {
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="absolute bottom-4 right-0 w-10 h-10 rounded-full bg-[#e8683f] hover:bg-[#d45b34] border-[3px] border-white shadow-lg flex items-center justify-center text-white transition-all duration-200"
            >
                <Camera size={18} fill="currentColor" />
            </button>

            {open && (
                <div className="absolute bottom-0 right-0 translate-x-[calc(100%+0.5rem)] bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 w-52 z-20">
                    <button
                        onClick={() => {
                            setViewOpen(true);
                            setOpen(false);
                        }}
                        disabled={!currentImage}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Eye size={15} className="text-gray-400" />
                        See Profile Picture
                    </button>
                    <button
                        onClick={() => {
                            onUploadClick();
                            setOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <Upload size={15} className="text-gray-400" />
                        Upload New Picture
                    </button>
                </div>
            )}

            {viewOpen && currentImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setViewOpen(false)}
                >
                    <img
                        src={currentImage}
                        alt="Profile"
                        className="max-w-full max-h-full rounded-2xl object-contain"
                    />
                </div>
            )}
        </div>
    );
}