import { useUserContext } from "@/context/AuthContext";
import { multiFormatDateString } from "@/lib/utils";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import Comment from "@/components/shared/Comment";
import { Button } from "@/components/ui/button";
import { useDeletePost, useGetCommentsByPostId, useGetPostById } from "@/lib/react-query/queriesAndMutations";
import CommentForm from "@/components/forms/CommentForm";
import { Models } from "appwrite";
import { useState } from "react";

import { toast } from "@/components/ui/use-toast";
import Modal from "@/components/shared/Modal";

const PostDetails = () => {
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || '');
  const { user } = useUserContext();
  const { data: comentarii, isPending: isPostLoading } = useGetCommentsByPostId(id || '');
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { mutate: deletePost } = useDeletePost();

  const handleDeletePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const confirmDeletePost = () => {
    if (post) {
      deletePost(post.$id); // Ensure post is defined before calling deletePost
      setIsModalOpen(false);
      setOpenPopupId(null);

      toast({
        title: 'Postarea a fost ștearsă'
      });

      navigate('/');
    }
  };

  return (
    <div className="post_details-container">
      {isPending ? <Loader /> : (
        <div className="post_details-card">
          {post?.isText === "1" ? (
            <div className="post_text-stats-container">
          
            </div>
          ) : (
            <div className="post_image-stats-container">
              {post?.isVideo === "1" ? (
                <video controls className="post-card_img">
                  <source src={post.imageUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={post?.imageUrl || 'assets/icons/profile-placeholder.svg'}
                  className="post-card_img"
                  alt="post"
                />
              )}

              <div className="hidden">
                <PostStats post={post} userId={user.id} />
              </div>
            </div>
          )}
          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link to={`/profile/${post?.creator.$id}`} className="flex items-center gap-3">
                <img
                  src={post?.creator?.imageUrl || '/assets/icons/profile-placeholder.svg'}
                  alt='creator'
                  className="rounded-full w-8 h-8 lg:w-12 lg:h-12"
                />
                <div className="flex flex-col">
                  <p className="base-medium lg:body-bold text-light-1"> {post?.creator.name} </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular"> {multiFormatDateString(post?.$createdAt)} </p>
                    -
                    <p className="subtle-semibold lg:small-regular">{post?.location}</p>
                  </div>
                </div>
              </Link>
              <div className="flex-center">
                <Link to={`/update-post/${post?.$id}`} className={`${user.id !== post?.creator.$id && 'hidden'}`}>
                  <img src="/assets/icons/edit.svg" width={24} height={24} alt="edit" />
                </Link>
                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ghost_details-delete_btn ${user.id !== post?.creator.$id && 'hidden'}`}
                >
                  <img
                    src="/assets/icons/delete.svg"
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>

                <Modal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onConfirm={confirmDeletePost}
                  title="Confirmare ștergere"
                  description="Ești sigur că vrei să ștergi această postare?"
                />
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string) => (
                  <li key={tag} className="text-light-3">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="comments-section max-h-40 overflow-y-auto custom-scrollbar w-full">
              {isPostLoading && !comentarii ? (
                <Loader />
              ) : (
                <ul className="flex flex-col flex-1 gap-2 w-full">
                  {comentarii?.documents.map((comentariu: Models.Document) => (
                    <Comment
                      comentariu={comentariu}
                      key={comentariu.$id}
                      openPopupId={openPopupId}
                      setOpenPopupId={setOpenPopupId}
                    />
                  ))}
                </ul>
              )}
            </div>

            <div className="add-comment mt-3 flex w-full">
              <CommentForm action={"Create"} />
            </div>
            <div className="w-10/12">
              <PostStats post={post} userId={user.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
