import { useState } from "react";
import { Button } from "../ui/button";

type ReportModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reasons: string[]) => void;
    title: string;
    description: string;
};

const ReportModal = ({ isOpen, onClose, onConfirm, title, description }: ReportModalProps) => {
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    
    const reasons = [
        "Spam",
        "Injurii sau limbaj neadecvat",
        "Discurs instigator la ură",
        "Informații false",
        "Conținut inadecvat",
        "Alt motiv"
    ];

    const handleCheckboxChange = (reason: string) => {
        setSelectedReasons(prev =>
            prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
        );
    };

    const handleConfirm = () => {
        onConfirm(selectedReasons);
        setSelectedReasons([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-zinc-800 rounded-lg p-6 shadow-lg max-w-md w-full">
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                <p className="mb-4">{description}</p>
                <div className="mb-4">
                    {reasons.map(reason => (
                        <label key={reason} className="block mb-2">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={selectedReasons.includes(reason)}
                                onChange={() => handleCheckboxChange(reason)}
                            />
                            {reason}
                        </label>
                    ))}
                </div>
                <div className="flex justify-center gap-10">
                    <Button
                        onClick={handleConfirm}
                        className="border border-gray-300 rounded hover:bg-black"
                        disabled={selectedReasons.length === 0}
                    >
                        Raportează
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="border border-gray-300 rounded hover:bg-black"
                    >
                        Anulează
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
