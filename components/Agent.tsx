"use client"
import { interviewer } from '@/constants';
import { createFeedback } from '@/lib/actions/general.action';
import { cn } from '@/lib/utils';
import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
// import { useRouter } from 'next/router';
import React, { useEffect, useState }  from 'react'
// import { set } from 'zod';

enum CallStatus{
    INACTIVE = 'INACTIVE',
    CONNECTING ='CONNECTING',
    ACTIVE ='ACTIVE',
    FINISHED='FINISHED',
}
interface SavedMessage {
    role:'user' | 'system' | 'assistant';
    content:string;
}
const Agent = ({userName,userId,type,interviewId,questions}:AgentProps) => {
    console.log("userName,userId,type,interviewId,questions",userName,userId,type,interviewId,questions)
    const router  = useRouter();
    const [isSpeaking,setIsSpeaking] =useState(false)

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
 
    const [messages, setMessages] = useState<SavedMessage[]>([]);
 console.log(messages)
    useEffect(()=>{
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE)    
    }
    const onCallEnd = () => {
        setCallStatus(CallStatus.FINISHED)    
    }
    const onMesssage = (message:Message)=>{
        if(message.type === 'transcript' && message.transcriptType === 'final'){
     const newMessage = {role :message.role,content:message.transcript}
     console.log(newMessage,"newMesas")
     setMessages((prev)=>[...prev,newMessage]);
        }
    }
    const onSpeechStart =()=>setIsSpeaking(true)
    const onSpeechEnd =()=>setIsSpeaking(false)
    const onError = (error:Error) => {
        console.error('Error:',error);
       
    }
    vapi.on('call-start',onCallStart);
    vapi.on('call-end',onCallEnd);
    vapi.on('message',onMesssage);
    vapi.on('speech-start',onSpeechStart);
    vapi.on('speech-end',onSpeechEnd);  
    vapi.on('error',onError);
        return () => {
            vapi.off('call-start',onCallStart);
            vapi.off('call-end',onCallEnd);
            vapi.off('message',onMesssage);
            vapi.off('speech-start',onSpeechStart);
            vapi.off('speech-end',onSpeechEnd);  
            vapi.off('error',onError);
        }    
},[])
    const handleGenerateFeedback = async(messages:SavedMessage[])=>{
        console.log("generate Feedback",messages)
        
        //TODO : Create a server action that generate feedback
        const {success,feedbackId:id}= await createFeedback({
            interviewId:interviewId!,
            userId:userId!,
            transcript:messages
        })
        if(success && id){
            router.push(`/interview/${interviewId}/feedback`);
        }else{
            console.log('Error saving feedback')
            router.push('/')
        }
    }
  useEffect(()=>{ 
    if(callStatus === CallStatus.FINISHED){
        if(type === "generate"){
            router.push('/')

        }else{
            handleGenerateFeedback(messages)
        }
    }

   },[messages,callStatus,userId,type,handleGenerateFeedback]) 

    const handleCall = async()=>{
setCallStatus(CallStatus.CONNECTING)
if(type === "generate"){
   const k=  await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,{
        variableValues:{
            username :userName,
            userid :userId,
        }
    })
    console.log("k",k)
}else{
    let formattedQuestions='';
    if(questions){
        formattedQuestions = questions.map((question)=>
            `- ${question}`
        ).join('\n');
    }

  const va =  await vapi.start(interviewer,{
        variableValues:{
            questions:formattedQuestions
        }
    })
// console.log("va",va)
}

    setCallStatus(CallStatus.ACTIVE)
    }
    const handleDisconnect = async()=>{
        setCallStatus(CallStatus.FINISHED)
        vapi.stop()
    }
    const latestMessage = messages[messages.length -1 ]?.content;
    console.log(latestMessage,"latest mesa")
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || 
    callStatus === CallStatus.FINISHED
  return (
    <>
    <div className='call-view'>
        <div className='card-interviewer'>
<div className='avatar'>
    <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className='object-cover' />
{isSpeaking && <s className='animate-speak'/>}
</div>
<h3>
    AI Interview
</h3>
        </div>
        {/* user profile card */}
<div className='card-border'>
    <div className='card-content'>
        <Image src="/user-avatar.png" alt="user-avatar" width={540} height={540} className='rounded-full object-cover size-[120px]' />
      <h3>{userName}</h3>  
    </div>
    </div>      
    </div>
    {messages?.length > 0  && (
        <div className='transcript-border'>
            <div className='transcript'>
<p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0','animate-fadeIn opacity-100')}>
{latestMessage}
</p>
            </div>

        </div>
    )}
    <div className='w-full flex justify-center'>
{callStatus !== 'ACTIVE'? (
    <button className='relative btn-call' onClick={handleCall}>
<span className={cn('absolute animate-ping rounded-full opacity-75',callStatus !== 'CONNECTING' && 'hidden')} />
   
<span>
{isCallInactiveOrFinished ? 'Call' : '. . .'} </span>
    </button>
):(
    <button className='btn-disconnect' onClick={handleDisconnect}>
End
    </button>
)}
    </div>
    </>
  )
}

export default Agent
