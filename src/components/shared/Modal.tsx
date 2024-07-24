import { Button } from "../ui/button";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
};

const Modal = ({ isOpen, onClose, onConfirm, title, description }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-zinc-800 rounded-lg p-6 shadow-lg max-w-md w-full">
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                <p className="mb-4">{description}</p>
                <div className="flex justify-center gap-10">
                    <Button onClick={onConfirm} className="border border-gray-300 rounded hover:bg-black">Da</Button>
                    <Button onClick={onClose} variant="secondary" className="border border-gray-300 rounded hover:bg-black">Anulează</Button>
                    
                </div>
            </div>
        </div>
    );
};

export default Modal;
