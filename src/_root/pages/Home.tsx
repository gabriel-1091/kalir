import TextPostForm from "@/components/forms/TextPostForm";
import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";

const Home = () => {
  const { data: posts, isPending: isPostLoading, isError: isErrorPosts} = useGetRecentPosts();

  const { data: creators, isLoading: isUserLoading, isError: isErrorCreators } = useGetUsers(10);

  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Ai pierdut conexiunea la internet</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Ai pierdut conexiunea la internet</p>
        </div>
      </div>
    );
  }

  return (

    
    <div className='flex flex-1'>
       
      <div className='home-container'>
      <div className="home-posts add-comment mt-3 flex w-full flex-col ">
        <h1 className="h3-bold md:h2-bold text-left w-full">La ce te gândești?</h1>
              <TextPostForm />
            </div>
        <div className='home-posts'>
          <h2 className='h3-bold md:h2-bold text-left w-full'>Feed principal</h2>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
                {posts?.documents.map((post: Models.Document) =>(
          
                   <PostCard post={post} key={post.caption}/>
                ))}
            </ul>
          ) }
        </div>
      </div>

      <div className="home-creators">
        <h3 className="h3-bold text-light-1">Creatori de top</h3>
        {isUserLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {creators?.documents.map((creator) => (
              <li key={creator?.$id}>
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
      
    </div>

     
  )
}

export default Home