import { useEffect, useState } from "react";
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { appwriteConfig, databases } from "@/lib/appwrite/config";


const LikedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();
  const [likedPosts, setLikedPosts] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (currentUser?.liked) {
        try {

          const postPromises = currentUser.liked.map(async (item: any) => {

            if (typeof item === "string" && item.length <= 36) {
              const post = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCollectionId,
                item
              );
              return post;
            } else if (typeof item === "object" && item.$id) {
              return item; 
            } else {
              console.error("Invalid post item:", item);
              return null;
            }
          });

          const posts = await Promise.all(postPromises);

          setLikedPosts(posts.filter(post => post !== null).reverse());
        } catch (error) {
          console.error("Error fetching liked posts:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLikedPosts();
  }, [currentUser]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <ul className="w-full flex justify-center max-w-5xl gap-9">
        {likedPosts.length === 0 ? (
          <p className="text-light-4">Nu ați apreciat nicio postare</p>
        ) : (
          <GridPostList posts={likedPosts} showStats={false} />
        )}
      </ul>
    </div>
  );
};

export default LikedPosts;
