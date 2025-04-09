import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import { dummyInterviews } from '@/constants'
import { getCurrentUser, getInterviewsByUserId, getLatestInterviews } from '@/lib/actions/auth.action'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Page =async () => {
  const user = await getCurrentUser();
  // 
  console.log(user, "user")
const [userInterviews,latestInterviews] = await Promise.all([
  getInterviewsByUserId(user?.id!),
  getLatestInterviews({userId:user?.id!})
])  
 
  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = latestInterviews?.length > 0;
  return (
    <>
      <section className='card-cta'>
<div className='flex flex-col gap-6 max-w-lg'>
  <h2>
    Get Interview-Ready with AI-Powered Practice & Feedback
  </h2>
  <p className='text-lg'>
    practice on real interview questions and get instant feedback.
  </p>
<Button asChild className='btn-primary max-sm:w-full'  > 
  <Link href="/interview">Start a interview</Link>
  </Button>
</div>
<Image src='/robot.png' alt="robo-dude" width={400} height={400} className='max-sm:hidden' />

      </section>
      <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Interviews</h2>
        {/* <div className='interviews-section'> */}
        <div className='interviews-section'>
          {/* <p>You haven&apos;t taken any interviews yet</p> */}
          {
hasPastInterviews ? (userInterviews?.map((interview) => (
<InterviewCard {...interview} key={interview.id} /> ))):(
<p>You havn&apos;t taken any interview yet</p>)
          }
          {/* {dummyInterviews.map((interview) => (
<InterviewCard {...interview} key={interview.id} />
))} */}
        </div>
        <section className='flex flex-col gap-6 mt-8'>
<h2>Take an interview</h2>
<div className='interviews-section'>

       {/* {dummyInterviews.map((interview) => (
<InterviewCard {...interview}  key={interview.id} />

))} */}

{
hasUpcomingInterviews ? (latestInterviews?.map((interview) => (
<InterviewCard {...interview} key={interview.id} /> ))):(
<p>There are no new interviews available </p>)
          }
</div>
        </section>
      </section>
    </>
  )
}

export default Page
