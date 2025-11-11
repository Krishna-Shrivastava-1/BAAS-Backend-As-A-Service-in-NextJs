'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Check, LogIn, LogOut, UserPlus } from "lucide-react"
import RegisterConfigFormFortenant from '@/components/RegisterConfigFormFortenant'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from 'sonner'

const services = [
  {
    title: "Register User",
    subServiceName: "Registeration",
    description: "Allow new users to sign up securely using email, password, or OAuth (Google, GitHub, etc.).",
    details: "When you integrate registration, the API will create a user entry in your database and return a secure JWT or session token. You can also enable email verification to prevent spam signups.",
    icon: UserPlus,
    configurable: true, // ✅ registration requires schema configuration
  },
  {
    title: "Login User",
    subServiceName: "Login",
    description: "Authenticate existing users with JWT-based or session-based login flow.",
    details: "On login, credentials are verified and a secure token is issued. You can configure token expiration, refresh tokens, and multi-factor authentication as optional layers.",
    icon: LogIn,
    configurable: false,
  },
  {
    title: "Logout User",
    subServiceName: "Logout",
    description: "Provide a secure logout endpoint to invalidate tokens and clear active sessions.",
    details: "Logout ensures session tokens are invalidated server-side. This prevents unauthorized reuse and improves account safety.",
    icon: LogOut,
    configurable: false,
  }
]

const Page = () => {
  const { id, service } = useParams()
  const router = useRouter()
  const [selectedService, setSelectedService] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [projectService, setProjectService] = useState([])
  const [loading, setLoading] = useState(true)

  // ✅ Fetch all existing subservices
  const fetchProjectServiceData = async () => {
    try {
      const resp = await axios.get(`/api/platform/project/fetchservice/${id}`)
      console.log(resp?.data)
      setProjectService(resp?.data?.projectServiceData || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectServiceData()
  }, [id, service])

  // ✅ Handle Login / Logout creation and redirection
  const handleDirectIntegration = async (subServiceName) => {
   
    
    try {
      if (subServiceName.toLowerCase() === 'login') {
        const resp = await axios.post(`/api/platform/project/subservice/loginschema/${id}`, {
          serviceName: service,
          subServiceName,
        })
        if (resp?.data?.success) {
          toast.success("Service Created Successfully")
          router.push(`/home/project/${id}/service/${service}/sub-service/${resp.data.projectServiceId}`)
        }
      } else {
        if (subServiceName.toLowerCase() === 'logout') {
        
          const resp = await axios.post(`/api/platform/project/subservice/logoutschema/${id}`, {
            serviceName: service,
            subServiceName,
          })
          if (resp?.data?.success) {
            toast.success("Service Created Successfully")
            router.push(`/home/project/${id}/service/${service}/sub-service/${resp.data.projectServiceId}`)
          }
        }
      }
      } catch (err) {
        console.log(err)
      }
    }

  if (loading) {
      return (
        <div className="m-6">
          <h1 className="text-center font-bold text-2xl mb-4">Authentication Setup</h1>
          <div className="flex flex-wrap gap-4 items-start justify-start">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-72 h-44 rounded-xl" />
            ))}
          </div>
        </div>
      )
    }

    // ✅ Main UI
    return (
      <div className="m-6">
        <h1 className="text-center font-bold text-2xl mb-4">Authentication Setup</h1>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          These authentication features can be integrated into your app to provide a complete user management flow.
          Each card explains its functionality clearly.
        </p>

        <div className="flex flex-wrap gap-4 items-start justify-start">
          {services.map(({ title, description, details, icon: Icon, subServiceName, configurable }) => {
            const existingService = projectService.find(
              (s) => s.subServiceName === subServiceName
            )

            const handleClick = () => {
              // if exists → redirect
              if (existingService) {
                router.push(`/home/project/${id}/service/${service}/sub-service/${existingService._id}`)
                return
              }

              // Registration opens sheet
              if (configurable) {
                setSelectedService({ title, description, details, subServiceName })
                setIsOpen(true)
              } else {
                // Login/Logout → direct integration API
                handleDirectIntegration(subServiceName)
              }
            }

            // ✅ Registration (with Sheet)
            if (configurable) {
              return (
                <Sheet
                  key={title}
                  open={isOpen && selectedService?.title === title}
                  onOpenChange={setIsOpen}
                >
                  <Card
                    className={`transition-all duration-200 border-2 border-border ${existingService ? 'hover:border-green-500' : 'hover:border-primary'} hover:shadow-lg ${existingService ? 'hover:bg-green-500/10' : 'hover:bg-primary/5'} cursor-pointer w-72 relative`}
                  >
                    {existingService && (
                      <div className='absolute top-2 right-3 p-2 rounded-full bg-accent text-green-500'>
                        <Check />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-6 h-6 ${existingService ? 'text-green-500' : 'text-primary'}`} />
                        <CardTitle className="text-lg">{title}</CardTitle>
                      </div>
                      <CardDescription className="text-sm text-muted-foreground">
                        {description}
                      </CardDescription>
                      <SheetTrigger asChild>
                        <div className='flex justify-end'>
                          <Button onClick={handleClick}>
                            {existingService ? 'Review' : 'Integrate'}
                          </Button>
                        </div>
                      </SheetTrigger>
                    </CardHeader>
                  </Card>

                  {!existingService && (
                    <SheetContent className="w-full sm:max-w-[100vw] md:max-w-[70vw] lg:max-w-[50vw]">
                      <SheetHeader>
                        <SheetTitle>{title}</SheetTitle>
                        <SheetDescription className="text-muted-foreground mt-2">
                          {details}
                        </SheetDescription>
                        <div>
                          <RegisterConfigFormFortenant projId={id} projService={service} />
                        </div>
                      </SheetHeader>
                    </SheetContent>
                  )}
                </Sheet>
              )
            }

            // ✅ Login / Logout cards
            return (
              <Card
                key={title}
                className={`transition-all duration-200 border-2 border-border ${existingService ? 'hover:border-green-500' : 'hover:border-primary'} hover:shadow-lg ${existingService ? 'hover:bg-green-500/10' : 'hover:bg-primary/5'} cursor-pointer w-72 relative`}
              >
                {existingService && (
                  <div className='absolute top-2 right-3 p-2 rounded-full bg-accent text-green-500'>
                    <Check />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-6 h-6 ${existingService ? 'text-green-500' : 'text-primary'}`} />
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    {description}
                  </CardDescription>
                  <div className='flex justify-end'>
                    <Button onClick={handleClick}>
                      {existingService ? 'Review' : 'Integrate'}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  export default Page
