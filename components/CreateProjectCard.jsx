'use client'
import { Button } from '@/components/ui/button'
import { Clipboard, ClipboardCheck, Plus } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from 'next/link'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { toast } from 'sonner'
import axios from 'axios'
import confetti from "canvas-confetti"

const CreateProjectCard = () => {
  const [checked, setchecked] = useState(false)
  const [projectTitle, setprojectTitle] = useState('')
  const [mongoUri, setmongoUri] = useState('')
  const [allowedDomain, setallowedDomain] = useState('')
  const [createdProjectData, setcreatedProjectData] = useState([])
  const [showAPI, setshowAPI] = useState(false)
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied Successsfully")
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
   const handleConfettiCannon = () => {
      const end = Date.now() + 3 * 1000 // 3 seconds
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"]
  
      const frame = () => {
        if (Date.now() > end) return
  
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors: colors,
        })
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors: colors,
        })
  
        requestAnimationFrame(frame)
      }
  
      frame()
    }
  const handleProjectCreation = async () => {
    if (!projectTitle || !mongoUri || projectTitle.trim() == "" || mongoUri.trim() == "") {
      return toast.warning("Fill the Fields Properly")
    }
    try {
      const resp = await axios.post('/api/platform/project/createproject', {
        title: projectTitle,
        mongoDbUri: mongoUri,
       allowedOrigins: allowedDomain
      })
      if (resp?.data?.success) {
        // console.log(resp?.data)
        handleConfettiCannon()
        setcreatedProjectData(resp?.data)
        toast.success("Project Created Successfully")
        setshowAPI(true)
      }else{
  
        toast.error(resp?.data?.message)
      }
    } catch (error) {
      // console.log(error.response.data.message)
      toast.error(error.response.data.message)
    }
  }
  // console.log( createdProjectData )
  return (
    <div>
      <div className='w-full flex items-center justify-start'>


        <AlertDialog>
          <AlertDialogTrigger><span>
            <div className='rounded-lg border-dashed flex items-center bg-primary/10 justify-center m-2 p-4 cursor-pointer select-none border-primary border-2   h-26 hover:bg-primary/20'>
              <h2 className='text-accent-foreground text-xl font-bold flex items-center' ><Plus strokeWidth={3} />Create Something</h2>
            </div>
          </span></AlertDialogTrigger>
          {
            showAPI && createdProjectData?.apiKey ?
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Your Project API Key</AlertDialogTitle>
                <div className="flex items-center gap-2">
  <input
    type="text"
    value={createdProjectData?.apiKey}
    readOnly
    className="flex-1 border rounded-md px-2 py-1 bg-muted text-sm"
  />
 <Button onClick={()=>handleCopy(createdProjectData?.apiKey)}>{copied ?<ClipboardCheck/> :<Clipboard />}</Button>
</div>
{/* <p className='text-destructive'>You will never copy this api key again</p> */}
                </AlertDialogHeader>
                <AlertDialogFooter>

                  <Link href={`/home/project/${createdProjectData?.projectId}`}>
                    <Button className='cursor-pointer select-none' >Continue</Button>
                  </Link>

                </AlertDialogFooter>
              </AlertDialogContent>
              :
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create Your Project</AlertDialogTitle>
                  <div>
                    <Field>
                      <FieldLabel htmlFor="title">Project Title</FieldLabel>
                      <Input id="title" onChange={(e) => setprojectTitle(e.target.value)?.trim()} className='my-2' type='text' required placeholder='Enter Project Title' />
                    </Field>
                 <Field>
  <FieldLabel htmlFor="mongo">MongoDB Connection URI</FieldLabel>
  <Input
    id="mongo"
    onChange={(e) => setmongoUri(e.target.value)?.trim()}
    className="my-2"
    type="text"
    required
    placeholder="mongodb+srv://username:password@cluster.mongodb.net/myDatabase"
  />
  <p className="text-xs text-muted-foreground mt-1">
    Paste your MongoDB connection string here. 
    Not sure how to get it?{" "}
    <a
      href="#"
      className="text-primary underline hover:text-primary/80"
    >
      Watch tutorial
    </a>
  </p>
</Field>

<Field>
  <FieldLabel htmlFor="frontend-url">Allowed Frontend URLs</FieldLabel>
  <Input
    id="frontend-url"
    onChange={(e) => setallowedDomain(e.target.value)?.trim()}
    className="my-2"
    type="text"
    required
    placeholder="https://yourfrontend.com or http://localhost:5173"
  />
  <p className="text-xs text-muted-foreground mt-1">
    Add your frontend’s base URL to allow it to call this project’s APIs. <br />
    If your app isn’t deployed yet, you can use{" "}
    <code className="bg-muted/50 px-1 rounded">http://localhost:5173</code>{" "}
    or{" "}
    <code className="bg-muted/50 px-1 rounded">http://localhost:3000</code>{" "}
    while developing.
  </p>
</Field>

                    <Label className="my-2  hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                      <Checkbox
                        id="toggle-2"
                        onCheckedChange={setchecked}
                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                      />
                      <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">
                          Allowing to Connect you Database
                        </p>
                        <p className="text-muted-foreground text-sm">
                          You can change at any time.
                        </p>
                      </div>
                    </Label>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel >Cancel</AlertDialogCancel>
                  {
                    checked ?
                      <Button onClick={handleProjectCreation} className='cursor-pointer select-none' >Create</Button>
                      :
                      <AlertDialogAction className=' cursor-not-allowed select-none' disabled>Create</AlertDialogAction>
                  }
                </AlertDialogFooter>
              </AlertDialogContent>
          }

        </AlertDialog>
      </div>
    </div>
  )
}

export default CreateProjectCard

