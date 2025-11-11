'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Database, FolderKanban, KeyRound } from "lucide-react"
import { Spinner } from './ui/spinner'

const ProjectCards = () => {
  const [data, setData] = useState([])
const [loading, setloading] = useState(true)
  const fetchProjects = async () => {
    try {
      const resp = await fetch(`/api/platform/project/getallproject`, {
        method: "GET",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await resp.json()
      setData(result?.projectData || [])
      setloading(false)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [loading])

  if (!data.length && !loading) {
    return (
      <div className="flex justify-center items-center h-48 text-muted-foreground">
        No projects found. Create your first project to get started.
      </div>
    )
  }
  if (loading) {
    return (
      <div className="flex justify-center gap-x-3 items-center h-48 text-muted-foreground">
       <Spinner />
       Loading...
      </div>
    )
  }
// console.log(data)
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">Your Projects</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((project) => (
          <Link href={`/home/project/${project?._id}`} key={project?._id}>
            <Card className="group transition-all duration-200 border-2 border-border hover:border-primary hover:shadow-lg hover:bg-primary/5 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <FolderKanban className="w-5 h-5 text-primary" />
                  <KeyRound className="w-4 h-4 text-muted-foreground opacity-70" />
                </div>
                <CardTitle className="text-lg truncate">{project?.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  {project?.subscriptionType || "Free Plan"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ProjectCards

