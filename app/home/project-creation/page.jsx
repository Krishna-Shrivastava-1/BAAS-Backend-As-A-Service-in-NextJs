'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"
import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation"


const page = () => {
  const router = useRouter()
    const [projectTitle, setprojectTitle] = useState('')
    const [password, setpassword] = useState('')

    const handleSignIn = async (e) => {
      e.preventDefault()
      try {
      const resp = await axios.post('/api/platform/auth/login',{
        projectTitle,
        password
      })
      if(resp?.data?.success){
        toast.success("Login Successfully")
        // console.log(resp?.data)
        router.push('/home')
        router.refresh()
      }else{
         toast.error(resp.data.message)
        //  console.log(resp?.data)
      }
      } catch (error) {
        console.log(error.message)
        toast.error(error.message)
      }
    }
  return (
    <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs bg-accent p-4 rounded-lg">
    <form onSubmit={handleSignIn} className={cn("flex flex-col gap-6")}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create Your Project</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your project details
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Title</FieldLabel>
          <Input onChange={(e)=>setprojectTitle(e.target.value)}  id="email" type="text" placeholder="DoraBase" required />
        </Field>
        <Field>
     
            <FieldLabel htmlFor="password">Mongo</FieldLabel>
           
          <Input onChange={(e)=>setpassword(e.target.value)}  id="password" type="text" required />
        </Field>
        <Field>
          <Button className='cursor-pointer' type="submit">Login</Button>
        </Field>
      
      
      </FieldGroup>
    </form>


    </div>
    </div>
  )
}

export default page
