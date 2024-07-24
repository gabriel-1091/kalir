import { Models } from "appwrite";
import Loader from "./Loader";
import GridPostList from "./GridPostList";

type SearchResultsProps = {
  isSearchFetching: boolean;
  searchedPosts: Models.Document[];
}

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultsProps) => {
  
  if(isSearchFetching) return <Loader />

  if(searchedPosts.length > 0){
    return (
      <GridPostList posts={searchedPosts} />
    )
  } 

  return (
    <p className="text-light-4 mt-10 text-center w-full">Nu s-au găsit rezultate</p>
  )
}

export default SearchResults;
