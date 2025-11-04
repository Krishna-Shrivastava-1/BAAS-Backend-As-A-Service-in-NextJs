import database from '@/database/database'
import { authenticateUser } from '@/lib/Authenticator'
import { projectModel } from '@/model/project'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, Database, Cloud, Bell } from "lucide-react"
import React from 'react'

const services = [
  {
    title: "Authentication",
    description:
      "Add secure user authentication with registration, login, logout, and role-based access — all via simple API endpoints.",
    icon: Shield,
    href: "Authentication",
  },
  {
    title: "Database",
    description:
      "Connect and manage your MongoDB, PostgreSQL, or custom data sources directly from your project dashboard.",
    icon: Database,
    href: "Database",
  },
  {
    title: "Storage",
    description:
      "Easily handle file uploads, media storage, and secure access URLs using your preferred cloud storage provider.",
    icon: Cloud,
    href: "Storage",
  },
  {
    title: "Notifications",
    description:
      "Send email, SMS, or push notifications using built-in or third-party integrations with minimal setup.",
    icon: Bell,
    href: "Notifications",
  },
]

const page = async ({ params }) => {
  const { id } = await params
  await database()

  const loggedUserCheck = await authenticateUser()
  if (!loggedUserCheck?.success) {
    return redirect('/sign-in')
  }

  const project = await projectModel.findById(id)

  return (
    <div className="p-6">
      <h1 className="text-center font-bold text-3xl mb-2">{project?.title}</h1>
      <p className="text-center text-muted-foreground mb-8">
        Extend your project by integrating key backend services below.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {services.map(({ title, description, icon: Icon, href }) => (
          <Link key={title} href={`/home/project/${id}/service/${href}`}>
            <Card className="transition-all duration-200 border-2 border-border hover:border-primary hover:shadow-lg hover:bg-primary/5 cursor-pointer h-full flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-right text-primary text-sm font-medium">
                  Configure →
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default page
