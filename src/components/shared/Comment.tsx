import { useEffect, useRef, useState } from "react";
import { multiFormatDateString } from "@/lib/utils";
import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useDeleteComment } from "@/lib/react-query/queriesAndMutations";
import Modal from "./Modal";
import ReportModal from "./ReportModal";
import { toast } from "../ui/use-toast";

type CommentProps = {
    comentariu: Models.Document;
    openPopupId: string | null;
    setOpenPopupId: (id: string | null) => void;
}

const Comment = ({ comentariu, openPopupId, setOpenPopupId }: CommentProps) => {
    const { user } = useUserContext();
    const popupRef = useRef<HTMLDivElement>(null);
    const { mutate: deleteComment } = useDeleteComment();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const handleDeleteComment = (e: React.MouseEvent) => {

        e.stopPropagation();
        setIsModalOpen(true);
    };
    
    const confirmDeleteComment = () => {
        deleteComment(comentariu.$id);
        setIsModalOpen(false);
        setOpenPopupId(null);

        toast({
            title: 'Comentariul a fost șters'
        });
    };

    const handleReportPost = () => {
        setIsReportModalOpen(true);
    };

    const confirmReportPost = (reasons: string[]) => {

        console.log("Comentariu raportat pentru motivele:", reasons);
        setIsReportModalOpen(false);

        toast({
            title: 'Comentariul a fost raportat'
        });
    };


    const handleClickOutside = (event: MouseEvent) => {
        if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
            setOpenPopupId(null);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="comment-wrapper relative">
            <div className="comment flex items-start gap-3 my-1">
                <Link to={`/profile/${comentariu.creator.$id}`}>
                    <img
                        src={comentariu.creator.imageUrl || '/assets/icons/profile-placeholder.svg'}
                        alt={comentariu.creator.username}
                        className="rounded-full w-8 h-8"
                    />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Link to={`/profile/${comentariu.creator.$id}`}>
                            <p className="text-light-1">{comentariu.creator.name}</p>                     
                        </Link>
                        <p className="text-light-3 text-xs opacity-75">{multiFormatDateString(comentariu.$createdAt)}</p>
                    </div>
                    <p className="text-light-2 text-base mt-1">{comentariu.text}</p>
                </div>
                <Button
                  onClick={() => setOpenPopupId(openPopupId === comentariu.$id ? null : comentariu.$id)}
                  variant="ghost"
                  className="ghost_details-delete_btn relative"
                >
                  <img
                    src="/assets/icons/dots.svg"
                    alt="options"
                    width={24}
                    height={24}
                  />
                </Button>
                {openPopupId === comentariu.$id && (
                    <div ref={popupRef} className="absolute right-0 mt-8 w-auto bg-black border border-gray-300 rounded shadow-md z-50">
                        <ul>
                            <li className={`ghost_details-delete_btn p-1 hover:bg-gray-700 cursor-pointer flex items-center gap-2 ${user.id !== comentariu?.creator.$id && 'hidden'}`}
                                onClick={handleDeleteComment} >

                                <img src="/assets/icons/delete.svg" width={20} height={20} alt="delete" />
                                Șterge
                            </li>

                            <hr className="border-dark-4/80" />

                            <li className={`p-1 hover:bg-gray-700 cursor-pointer gap-2 flex items-center ${user.id === comentariu?.creator.$id && 'hidden'} `}
                                onClick={handleReportPost} >
                                    
                                <img src="/assets/icons/report.svg" width={20} height={20} alt="delete"  />
                                Raportează
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            <hr className="absolute bottom-0 left-0 w-6/12 border border-dark-4/80 ml-10" />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDeleteComment}
                title="Confirmare ștergere"
                description="Ești sigur că vrei să ștergi acest comentariu?"
            />

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onConfirm={confirmReportPost}
                title="Raportează comentariul"
                description="Selectează motivele pentru continutul incalca regulile:"
            />
        </div>
    );
};

export default Comment;
