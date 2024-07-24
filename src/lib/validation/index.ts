import { z } from "zod";

export const SignupValidation = z.object({
  name: z.string().min(2, { message: 'Textul introdus este prea scurt!' }),
  username: z.string().min(2, { message: 'Textul introdus este prea scurt!' }),
  email: z.string().email(),
  password: z.string().min(8, { message: 'Parola trebuie să aibă cel puțin 8 caractere.' })
});

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: 'Parola trebuie să aibă cel puțin 8 caractere.' })
});

export const PostValidation = z.object({
  caption: z.string().min(5).max(2200),
  file: z.custom<File[]>().refine(files => 
    files.every(file => ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'video/mp4', 'video/webm'].includes(file.type)), 
    { message: "Fișierele trebuie să fie în format PNG, JPEG, JPG, SVG, MP4 sau WEBM" }
  ),
  location: z.string().min(2).max(100),
  tags: z.string(),
});

export const ProfileValidation = z.object({
  file: z.custom<File[]>().refine(files => 
    files.every(file => ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'video/mp4', 'video/webm'].includes(file.type)), 
    { message: "Fișierele trebuie să fie în format PNG, JPEG, JPG, SVG, MP4 sau WEBM" }
  ),
  name: z.string().min(2, { message: "Numele trebuie să aibă cel puțin 2 caractere." }),
  username: z.string().min(2, { message: "Numele trebuie să aibă cel puțin 2 caractere." }),
  email: z.string().email(),
  bio: z.string(),
});

export const CommentValidation = z.object({
  text: z.string().min(2).max(2200)
});
