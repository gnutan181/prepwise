import InterviewGeneratorForm from '@/components/InterviewGeneratorForm'
import { getCurrentUser } from '@/lib/actions/auth.action'
import React from 'react'

const page = async() => {
    const user = await getCurrentUser()
    console.log(user,"user")
  return (
    <>
     <InterviewGeneratorForm userName={user?.name || ''} userId={user?.id} />
    </>
  )
}

export default page
