export const dynamic = "force-dynamic";

import CreateProjectCard from '@/components/CreateProjectCard'
import ProjectCards from '@/components/ProjectCards';
import { FieldSeparator } from '@/components/ui/field';
import { authenticUserDataLoggedIn } from '@/lib/LoggedInUsers';
import { cookies } from 'next/headers';
import Link from 'next/link'

import React from 'react'


const page = async () => {
const userDat = await authenticUserDataLoggedIn()
// console.log(userDat)
  return (
    <div>
      <h1 className='text-center font-bold text-3xl'>Hello, {userDat?.user?.name}</h1>
      <p className='text-center font-semibold'>Welcome Back to DoraBase</p>
  
      <CreateProjectCard />
          <FieldSeparator></FieldSeparator>
    <ProjectCards />
    </div>
  )
}

export default page
