
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useForm } from "react-hook-form"
import { Link, useNavigate } from 'react-router-dom'

import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Loader from "@/components/shared/Loader"

import { SigninValidation } from "@/lib/validation"

import { useToast } from "@/components/ui/use-toast"
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"


"use client"

const SigninForm = () => {
  const { toast } = useToast()
  const { checkAuthUser, isLoading: isUserLoading} = useUserContext();
  const navigate = useNavigate();
  
  const { mutateAsync: signInAccount } = useSignInAccount();

  // 1. Define your form.
  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: '',
      password: '',
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof SigninValidation>) {
    
    const session = await signInAccount({
      email: values.email, 
      password: values.password,
    })

    if(!session) {
      return toast({ title: 'Autentificarea a eșuat. Vă rugăm să încercați din nou!'})
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

      <h2 className="h3-bold md:h2-bold pt-2 sd:pt-12">Conectați-vă la contul dvs.</h2>
      <p className="text-light-3 small-medium md:base-regular mt-2">Bine ați revenit!</p>
   
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
       
         <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email:</FormLabel>
              <FormControl>
                <Input type="email" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="shad-button_primary">
        {isUserLoading ? (
          <div className="flex-center gap-2">
            <Loader />  Se încarcă...
          </div>
        ): "Sign in"}
        </Button>

        <p className="text-small-regular text-light-2 text-center mt-2">
          Nu aveți cont?
          <Link to="/sign-up" className="text-primary-500 text-small-semibold ml-1">Înregistrare</Link>
          
        </p>

      </form>
    </div>
  </Form>
  )
}

export default SigninForm