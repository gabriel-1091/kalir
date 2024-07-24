import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query'

import { createComment, createPost, createTextPost, createUserAccount, deleteComment, deletePost, deleteSavedPost, getCommentsByPostId, getCurrentUser, getInfinitePosts, getPostById, getRecentPosts, getUserById, getUsers, likePost, savePost, searchPosts, signInAccount, signOutAccount, updatePost, updateUser } from '../appwrite/api'
import { INewComment, INewPost, INewUser, IUpdatePost, IUpdateUser } from '@/types'
import { QUERY_KEYS } from './queryKeys';

export const useCreateUserAccount= () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    });
}

export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: {
              email: string;
              password: string;
            }) => signInAccount(user)
    });
}

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount
    });
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

export const useCreateTextPost = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({caption, userId} : { caption: string; userId: string}) => createTextPost(caption, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}


export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    })
}

export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, likesArray }: { postId: string; likesArray: string[]}) => likePost(postId, likesArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useSavePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, userId }: { postId: string; userId: string}) => savePost(postId, userId),
        onSuccess: () => {
            
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ( savedRecordId: string ) => deleteSavedPost(savedRecordId),
        onSuccess: () => {
            
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser
    })
}

export const useGetPostById = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId,
    })
}

export const useUpdatePost = () => {

    const queryClient = useQueryClient();

    return useMutation({
        
        mutationFn: (post: IUpdatePost) => updatePost(post),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
        }
    })
}

export const useGetPosts = () => {
    return useInfiniteQuery({
      queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      queryFn: getInfinitePosts as any,
      getNextPageParam: (lastPage: any) => {
        if (lastPage && lastPage.documents.length === 0) {
          return null;
        }
        const lastId = (lastPage.documents[lastPage.documents.length - 1].$id);
        return lastId;
      },
      initialPageParam: null,
    });
   }


export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
        queryFn: () => searchPosts(searchTerm),
        enabled: !!searchTerm
    })
}

export const useGetUsers = (limit?: number) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USERS],
      queryFn: () => getUsers(limit),
    });
  };

  export const useGetUserById = (userId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
      queryFn: () => getUserById(userId),
      enabled: !!userId,
    });
  };

  export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (user: IUpdateUser) => updateUser(user),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
        });
      },
    });
  };

  export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (comment: INewComment) => createComment(comment),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST_ID, data?.postId]
            })
        }
    })
}


export const useGetCommentsByPostId = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST_ID, postId],
        queryFn: () => getCommentsByPostId(postId),
        enabled: !!postId,
    });
}

export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ( commentId: string ) => deleteComment(commentId),
        onSuccess: () => {
            
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST_ID]
            })
        }
    })
}

export const useDeletePost = () => {

    const queryClient = useQueryClient();

    return useMutation({
        
        mutationFn: (postId: string) => deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries( {
                queryKey: [QUERY_KEYS.GET_INFINITE_POSTS]
            })
        }
    })
}