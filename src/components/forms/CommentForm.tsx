"use client"

import { useUserContext } from "@/context/AuthContext";
import { useCreateComment, useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentValidation } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { toast } from "../ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useParams } from "react-router-dom";

type CommentProps = {
    comment?: Models.Document;
    action: 'Create';
};



const CommentForm = ({ comment, action }: CommentProps) => {
    const { mutateAsync: createComment, isPending: isLoadingCreate } = useCreateComment();
    const { user } = useUserContext();
    const { id } = useParams();
    const { data: post } = useGetPostById(id || '');


    // Define your form.
    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            text: comment ? comment?.text : "",
        },
    });

    // Define a submit handler.
    async function onSubmit(values: z.infer<typeof CommentValidation>) {

        if (action === 'Create') {
            try {

                if (!post?.$id) {
                    throw new Error("Post ID is missing.");
                }

                const newComment = await createComment({
                    ...values,
                    userId: user.id,
                    postId: post.$id 
                });

                if (!newComment) {
                    toast({
                        title: 'Încercați din nou'
                    });
                } else {
                    toast({
                        title: 'Comentariu creat cu succes!'
                    });
                    form.reset();
                }
            } catch (error) {
                toast({
                    title: 'A apărut o eroare',
                });
            }
        }
    }

    return (
        <div className="w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center">
                    <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Textarea
                                        className="w-full h-12 px-4 py-2 rounded-lg bg-dark-4 outline-none resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="shad-button_primary whitespace-nowrap ml-2 h-12"
                        disabled={isLoadingCreate}
                    >
                        {isLoadingCreate ? 'Loading...' : 'Postează'}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default CommentForm;
