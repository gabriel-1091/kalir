import { INewComment, INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { ID, Query } from 'appwrite';
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl
        });

        return newUser;

    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        );

        return newUser;

    } catch (error) {
        console.log(error);
    }
}

export async function signInAccount (user: { email: string; password: string }) {
    try {
        const session = await account.createEmailSession(user.email, user.password)

        return session;
    } catch (error) {
        console.log(error);
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}

export async function signOutAccount() {
    try {

        const session = await account.deleteSession("current");
        return session;

    } catch (error) {
        console.log(error);
    }
}

export async function createPost(post: INewPost) {
    try {
        if (!post.file || post.file.length === 0) {
            throw new Error('No file provided');
        }

        // Upload the file to Appwrite storage
        const uploadedFile = await uploadFile(post.file[0]);

        if (!uploadedFile) throw new Error('File upload failed');

        // Obtain the URL of the file
        let fileUrl;
        if (post.file[0].type.startsWith('video/')) {
            fileUrl = getFileView(uploadedFile.$id);
        } else {
            fileUrl = getFilePreview(uploadedFile.$id);
        }

        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw new Error('File preview generation failed');
        }

        // Determine if the file is a video
        const isVideo = post.file[0].type.startsWith('video/') ? "1" : "0";

        // Convert tags to an array
        const tags = post.tags?.replace(/ /g, '').split(',') || [];

        // Save the post to the database
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags,
                isVideo: isVideo
            }
        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw new Error('Post creation failed');
        }

        return newPost;
    } catch (error) {
        console.log(error);
    }
}

export async function uploadFile(file: File){
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );

        return uploadedFile;
    } catch (error) {
        console.log(error);
    }
}

export function getFilePreview(fileId: string){
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            "top",
            100,
        )

        if(!fileUrl) throw Error;
        return fileUrl;

    } catch (error) {
        console.log(error);
    }
}

export function getFileView(fileId: string){
    try {
        const fileUrl = storage.getFileView(
            appwriteConfig.storageId,
            fileId,
        )

        if(!fileUrl) throw Error;
        return fileUrl;

    } catch (error) {
        console.log(error);
    }
}


export async function deleteFile(fileId: string){
    try {

        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return { status: 'ok'};

    } catch (error) {
        console.log(error);
    }
}

export async function getRecentPosts() {
    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    )

    if(!posts) throw Error;
    return posts;
}

export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        )
        if(!updatedPost) throw Error;

        return updatedPost;

    } catch (error) {
        console.log(error);
    }
}

export async function savePost(postId: string, userId: string) {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId,
            }
        )
        if(!updatedPost) throw Error;

        return updatedPost;
        
    } catch (error) {
        console.log(error);
    }
}

export async function deleteSavedPost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
           savedRecordId,
        )
        if(!statusCode) throw Error;

        return {status: 'ok'};
        
    } catch (error) {
        console.log(error);
    }
}

export async function getPostById(postId: string) {

    if (!postId) throw Error;
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )
        
        if (!post) throw Error;
        return post;

    } catch (error) {
        console.log(error);
    }
}

export async function updatePost(post: IUpdatePost) {

    const hasFileToUpdate = post.file.length > 0;

    try {

        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId
        }

        if(hasFileToUpdate) {

             // incarcam imaginea in storage-ul de pe Appwrite
            const uploadedFile = await uploadFile(post.file[0]);

            if(!uploadedFile) throw Error;
            
            // obtinem URL-ul fisierului
            const fileUrl = getFilePreview(uploadedFile.$id);

            if(!fileUrl){
                await deleteFile(uploadedFile.$id);
                throw Error; 
            } 

            image = {...image, imageUrl: fileUrl, imageId: uploadedFile.$id}
        }

        // convertim tag-urile intr-un array
        const tags = post.tags?.replace(/ /g, '').split(',') || [];

        // salvam postarea in baza de date
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags
            }
        )

        if(!updatedPost) {
            await deleteFile(post.imageId);
            throw Error;
        }

        return updatedPost;

    } catch (error) {
        console.log(error);
    }
}

export async function deletePost(postId: string) {
    if(!postId) throw Error;

    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,

        )
        
    } catch (error) {
        console.log(error);
    }
}

export async function getInfinitePosts({ pageParam } : { pageParam: number}) {
    const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]

    if(pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        )

        if(!posts) throw Error;
        return posts;

    } catch (error) {
        console.log(error);
    }
}

export async function searchPosts(searchTerm: string) {
    
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)]
        )

        if(!posts) throw Error;
        return posts;

    } catch (error) {
        console.log(error);
    }
}

export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];
  
    if (limit) {
      queries.push(Query.limit(limit));
    }
  
    try {
      const users = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        queries
      );
  
      if (!users) throw Error;
  
      return users;
    } catch (error) {
      console.log(error);
    }
  }

  export async function getUserById(userId: string) {
    try {
      const user = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId
      );
  
      if (!user) throw Error;
  
      return user;
    } catch (error) {
      console.log(error);
    }
  }

export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try {
      let image = {
        imageUrl: user.imageUrl,
        imageID: user.imageId,
      };
  
      if (hasFileToUpdate) {

        const uploadedFile = await uploadFile(user.file[0]);
        if (!uploadedFile) throw Error;
  

        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
          await deleteFile(uploadedFile.$id);
          throw Error;
        }
  
        image = { ...image, imageUrl: fileUrl, imageID: uploadedFile.$id };
      }
  

      const updatedUser = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        user.userId,
        {
          name: user.name,
          bio: user.bio,
          imageUrl: image.imageUrl,
          imageID: image.imageID,
        }
      );
  
 
      if (!updatedUser) {
        if (hasFileToUpdate) {
          await deleteFile(image.imageID);
        }

        throw Error;
      }
  
      if (user.imageId && hasFileToUpdate) {
        await deleteFile(user.imageId);
      }
  
      return updatedUser;
    } catch (error) {
      console.log(error);
    }
  }

  export async function createComment(comment: INewComment) {
    try {
        const newComment = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            ID.unique(),
            { text: comment.text,
              creator: comment.userId,
              postId: comment.postId
            }
        );

        return newComment;
    } catch (error) {
        console.log(error);
    }
}

export async function getCommentsByPostId(postId: string) {
    try {
        const comments = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            [Query.equal('postId', postId), Query.orderAsc('$createdAt')]
        );

        return comments;
    } catch (error) {
        console.log(error);
    }
}


export async function deleteComment(commentId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            commentId,
        )
        if(!statusCode) throw Error;

        return {status: 'ok'};
        
    } catch (error) {
        console.log(error);
    }
}

export async function createTextPost(caption: string, userId: string) {
    try {
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: userId,
                caption: caption,
                imageUrl: null,
                imageId: null,
                location: null,
                tags: [],
                isVideo: "0",
                isText: "1"
            }
        );

        if (!newPost) {
            throw new Error('Eroare la crearea postarii');
        }

        return newPost;
    } catch (error) {
        console.error(error);
    }
}
