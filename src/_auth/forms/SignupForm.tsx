
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from 'react-router-dom'

import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Loader from "@/components/shared/Loader"
import { SignupValidation } from "@/lib/validation"
import { z } from "zod"

import { useToast } from "@/components/ui/use-toast"
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"


"use client"

const SignupForm = () => {
  const { toast } = useToast()
  const { checkAuthUser} = useUserContext();
  const navigate = useNavigate();

  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateUserAccount();
  
  const { mutateAsync: signInAccount } = useSignInAccount();

  
  // 1. Define your form.
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  })
 

  async function onSubmit(values: z.infer<typeof SignupValidation>) {
    const newUser = await createUserAccount(values);

    if(!newUser) return toast({
      title: "Înregistrarea a eșuat. Vă rugăm să încercați din nou.",
    })

    const session = await signInAccount({
      email: values.email, 
      password: values.password,
    })

    if(!session) {
      return toast({ title: 'Autentificarea a eșuat. Vă rugăm să încercați din nou.'})
    }

    // stocam sesiunea in contextul react - trebuie sa stim mereu ca avem un user logat
    const isLoggedIn = await checkAuthUser();
    if(isLoggedIn) {
      form.reset();
      navigate('/')
    } else {
      return toast({ title:'Înregistrarea a eșuat. Vă rugăm să încercați din nou.'})
    }
  }

  return (
    <Form {...form}>

    <div className="sm:w-420 flex-center flex-col">

      <img src="/assets/images/logo.svg" alt="logo" />

      <h2 className="h3-bold md:h2-bold pt-2 sd:pt-12">Creați un cont nou</h2>
      <p className="text-light-3 small-medium md:base-regular mt-2">Vă rugăm să introduceți datele dvs. pentru a începe</p>
   
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nume:</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage style={{ color: 'MediumSlateBlue' }}/>
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nume de utilizator:</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage style={{ color: 'MediumSlateBlue' }}/>
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email:</FormLabel>
              <FormControl>
                <Input type="email" className="shad-input" {...field} />
              </FormControl>
              <FormMessage style={{ color: 'MediumSlateBlue' }}/>
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parolă:</FormLabel>
              <FormControl>
                <Input type="password" className="shad-input" {...field} />
              </FormControl>
              <FormMessage style={{ color: 'MediumSlateBlue' }}/>
            </FormItem>
          )}
        />
        <Button type="submit" className="shad-button_primary">
        {isCreatingAccount ? (
          <div className="flex-center gap-2">
            <Loader />  Se încarcă...
          </div>
        ): "Înscriere"}
        </Button>

        <p className="text-small-regular text-light-2 text-center mt-2">
        Aveți deja cont?
          <Link to="/sign-in" className="text-primary-500 text-small-semibold ml-1">Autentificare</Link>
          
        </p>

      </form>
    </div>
  </Form>
  )
}

export default SignupForm