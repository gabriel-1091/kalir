"use client";

import { useUserContext } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "../ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentValidation } from "@/lib/validation";
import { useState, useEffect, useRef } from "react";
import { useCreateTextPost } from "@/lib/react-query/queriesAndMutations";


const TextPostForm = () => {
    const { user } = useUserContext();
    const [text, setText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { mutateAsync: createTextPost, isPending: isLoadingCreate } = useCreateTextPost();

    // Define your form.
    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            text: "",
        },
    });

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    // Define a submit handler.
    async function onSubmit(values: z.infer<typeof CommentValidation>) {
        try {
            const newPost = await createTextPost({
                userId: user.id,
                caption: values.text,
            });

            if (!newPost) {
                toast({
                    title: 'Încercați din nou'
                });
            } else {
                toast({
                    title: 'Postare creată cu succes!'
                });
                form.reset();
                setText("");
            }
        } catch (error) {
            toast({
                title: 'A apărut o eroare',
            });
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
                                    className="w-full h-auto px-4 py-2 rounded-lg bg-dark-4 outline-none resize-none"
                                    {...field}
                                    ref={field.ref}  // Automatically updates textareaRef.current
                                    value={text}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        setText(e.target.value);
                                    }}
                                />

                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="shad-button_orange whitespace-nowrap ml-2 h-12"
                        disabled={isLoadingCreate}
                    >
                        {isLoadingCreate ? 'Loading...' : 'Publică'}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default TextPostForm;
