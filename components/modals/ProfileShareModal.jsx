import React, { useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation";
import { FileText, Upload, X } from "lucide-react";

const cleanValue = (value) => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value).trim();
    if (!stringValue || stringValue.toLowerCase() === "null") return "";
    return stringValue;
};

const extractDocUrl = (doc) => cleanValue(doc?.doc?.secure_url || doc?.doc?.url || doc?.secure_url || doc?.url);

const extractDocName = (doc, docUrl) => {
    const explicitName = cleanValue(doc?.name);
    if (explicitName) return explicitName;

    const publicId = cleanValue(doc?.doc?.public_id || doc?.public_id);
    if (publicId) {
        const parts = publicId.split("/");
        return parts[parts.length - 1];
    }

    if (docUrl) {
        return decodeURIComponent(String(docUrl).split("/").pop() || "") || "Document";
    }

    return "Document";
};

const ProfileShareModal = ({ open, setOpen, user }) => {
    const [selectedDocIds, setSelectedDocIds] = useState([]);
    const router = useRouter();

    const docs = useMemo(() => {
        const profile = user?.profile || {};
        const upDocs = Array.isArray(profile?.up_docs) ? profile.up_docs : [];
        return upDocs
            .map((doc, index) => {
                const docUrl = extractDocUrl(doc);
                if (!docUrl) return null;

                const docName = extractDocName(doc, docUrl);
                return {
                    id: `doc_${index}`,
                    name: docName,
                    url: docUrl,
                };
            })
            .filter(Boolean);
    }, [user]);


    // console.log("docsss", user);

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setSelectedDocIds([]);
        }
    };

    const handleDocSelect = (docId) => {
        setSelectedDocIds((prev) => {
            if (prev.includes(docId)) {
                return prev.filter((id) => id !== docId);
            }
            return [...prev, docId];
        });
    };

    const handleSelectAll = () => {
        const allIds = docs.map((doc) => doc.id);
        if (selectedDocIds.length === allIds.length) {
            setSelectedDocIds([]);
            return;
        }
        setSelectedDocIds(allIds);
    };

    const isAllSelected = docs.length > 0 && selectedDocIds.length === docs.length;

    const handleConfirm = () => {
        if (selectedDocIds.length === 0) return;

        const selectedDocs = docs.filter((doc) => selectedDocIds.includes(doc.id));
        let message = `*Share Documents*\n\n`;
        selectedDocs.forEach((doc) => {
            message += `${doc.name}: ${doc.url}\n`;
        });

        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");

        setOpen(false);
        setSelectedDocIds([]);
    };

    const goToProfile = () => {
        setOpen(false);
        setSelectedDocIds([]);
        router.push("/profile#essential-documents-section");
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[680px] rounded-[26px] p-0 overflow-hidden bg-[#eff0f8] border border-[#d8d9e6] [&>button:last-child]:hidden">
                <DialogTitle className="sr-only">Share Documents</DialogTitle>
                <div className="px-6 py-5 border-b border-[#d4d6e3]">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-[40px] md:text-[34px] leading-none font-semibold text-[#202432]">
                            Share Documents
                        </h2>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="flex items-center gap-2 text-[#3d4152]"
                            >
                                <div className={`w-8 h-8 rounded border-[3px] ${isAllSelected ? "bg-[#4a5570] border-[#4a5570]" : "border-[#4a5570]"} flex items-center justify-center`}>
                                    {isAllSelected && (
                                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-[34px] md:text-[28px] leading-none">All</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOpenChange(false)}
                                className="text-[#3d4152]"
                                aria-label="Close"
                            >
                                <X className="w-10 h-10" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-5">
                    <div className="max-h-[48vh] overflow-y-auto space-y-4 pb-3">
                        {docs.length > 0 ? docs.map((doc) => {
                            const isSelected = selectedDocIds.includes(doc.id);
                            return (
                                <button
                                    key={doc.id}
                                    type="button"
                                    className={`w-full text-left rounded-2xl border px-4 py-4 shadow-sm transition ${isSelected ? "border-[#4f5f86] bg-[#ebedf8]" : "border-[#d4d6e3] bg-[#f3f4fb]"}`}
                                    onClick={() => handleDocSelect(doc.id)}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-14 h-14 rounded-2xl bg-[#e7e8f2] flex items-center justify-center shrink-0">
                                                <FileText className="w-8 h-8 text-[#8b8d97]" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xl font-semibold text-[#222533] truncate">{doc.name}</h3>
                                                <p className="text-lg text-[#9295a1]">Uploaded Document</p>
                                            </div>
                                        </div>
                                        <div className={`w-8 h-8 rounded border-[3px] shrink-0 ${isSelected ? "bg-[#4a5570] border-[#4a5570]" : "border-[#4a5570]"} flex items-center justify-center`}>
                                            {isSelected && (
                                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        }) : (
                            <div className='text-center py-10 text-gray-500 bg-[#f3f4fb] rounded-2xl border border-[#d4d6e3]'>
                                No uploaded documents found
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-[#d4d6e3]">
                    <div className="flex flex-row gap-3">
                    <button
                        type="button"
                        onClick={goToProfile}
                            className="w-1/2 h-14 rounded-full border-2 border-[#7b8097] text-[#0d5fb7] text-lg md:text-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#e8ecf8] transition"
                    >
                        <Upload className="w-5 h-5" />
                        Manage Documents
                    </button>

                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={selectedDocIds.length === 0}
                            className={`w-1/2 h-14 rounded-full text-lg md:text-xl font-semibold transition ${selectedDocIds.length > 0 ? 'bg-[#1f68be] text-white hover:bg-[#1556a0]' : 'bg-[#c8cad7] text-[#8c8f9b] cursor-not-allowed'}`}
                        >
                            Share {selectedDocIds.length} Documents
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ProfileShareModal
