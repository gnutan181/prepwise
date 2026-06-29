"use client"
import { interviewer } from '@/constants';
import { createFeedback } from '@/lib/actions/general.action';
import { cn } from '@/lib/utils';
import { getVapi } from '@/lib/vapi.sdk';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
// import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState }  from 'react'
import { toast } from 'sonner';
// import { set } from 'zod';

enum CallStatus{
    INACTIVE = 'INACTIVE',
    CONNECTING ='CONNECTING',
    ACTIVE ='ACTIVE',
    ENDING='ENDING',
    FINISHED='FINISHED',
}
interface SavedMessage {
    role:'user' | 'system' | 'assistant';
    content:string;
}

const FALLBACK_ERROR_MESSAGE = 'Something went wrong while starting the interview call.';

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const readErrorMessage = (error: unknown): string | null => {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string' && error.trim()) return error;

    if (isObject(error)) {
        const nestedError = readErrorMessage(error.error);
        if (nestedError) return nestedError;

        for (const key of ['message', 'errorMsg', 'reason']) {
            const value = error[key];
            if (typeof value === 'string' && value.trim()) return value;
        }

        if (error.details) {
            return typeof error.details === 'string'
                ? error.details
                : JSON.stringify(error.details);
        }
    }

    return null;
}

const getErrorMessage = (error: unknown) => {
    return readErrorMessage(error) ?? FALLBACK_ERROR_MESSAGE;
}

const getErrorDetails = (error: unknown) => {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    return error;
}

const isExpectedStopError = (message: string) => {
    const normalizedMessage = message.toLowerCase();

    return (
        normalizedMessage.includes('meeting ended due to ejection') ||
        normalizedMessage.includes('meeting has ended')
    );
}

const Agent = ({userName,userId,type,interviewId,questions}:AgentProps) => {
    // console.log("userName,userId,type,interviewId,questions",userName,userId,type,interviewId,questions)
    const router  = useRouter();
    const [isSpeaking,setIsSpeaking] =useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
 
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const callStatusRef = useRef(CallStatus.INACTIVE);
    const hadCallError = useRef(false);
    const isStartingCall = useRef(false);
    const isEndingCall = useRef(false);
    const updateCallStatus = (status: CallStatus) => {
        callStatusRef.current = status;
        setCallStatus(status);
    }
//  console.log(messages,"messages")
    useEffect(()=>{
        let vapi;

        try {
            vapi = getVapi();
        } catch (error) {
            const message = getErrorMessage(error);
            setErrorMessage(message);
            return;
        }

        const onCallStart = () => {
            isEndingCall.current = false;
            hadCallError.current = false;
            updateCallStatus(CallStatus.ACTIVE)
    }
    const onCallEnd = () => {
        isEndingCall.current = false;
        setIsSpeaking(false);
        updateCallStatus(hadCallError.current ? CallStatus.INACTIVE : CallStatus.FINISHED)
    }
    const onMesssage = (message:Message)=>{
        if(message.type === 'transcript' && message.transcriptType === 'final'){
     const newMessage = {role :message.role,content:message.transcript}
    //  console.log(newMessage,"newMesas")
     setMessages((prev)=>[...prev,newMessage]);
        }
    }
    const onSpeechStart =()=>setIsSpeaking(true)
    const onSpeechEnd =()=>setIsSpeaking(false)
    const onError = (error:Error) => {
        const message = getErrorMessage(error);

        const isEndingOrEnded =
            isEndingCall.current ||
            callStatusRef.current === CallStatus.ENDING ||
            callStatusRef.current === CallStatus.FINISHED;

        if (isEndingOrEnded && isExpectedStopError(message)) {
            console.info('Vapi call ended normally:', getErrorDetails(error));
            return;
        }

        hadCallError.current = true;
        isEndingCall.current = false;

        console.error('Vapi error:', getErrorDetails(error));
        setErrorMessage(message);
        updateCallStatus(CallStatus.INACTIVE);
        toast.error(message);
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
  useEffect(()=>{ 
    if(callStatus !== CallStatus.FINISHED){
        return;
    }

    if(type === "generate"){
        router.push('/')
        return;
    }

    if(!interviewId || !userId){
        setErrorMessage('Missing interview context. Please reload and try again.');
        updateCallStatus(CallStatus.INACTIVE);
        return;
    }
// console.log("messages use",interviewId,userId,messages)
    if(messages.length === 0){
        const message = 'No interview transcript was captured, so feedback could not be generated.';
        setErrorMessage(message);
        updateCallStatus(CallStatus.INACTIVE);
        toast.error(message);
        return;
    }
// console.log("generate Feedback",messages)
    const saveFeedback = async () => {
        // console.log("generate Feedback",messages)

        const {success,feedbackId:id}= await createFeedback({
            interviewId,
            userId,
            transcript:messages
        })

        if(success && id){
            router.push(`/interview/${interviewId}/feedback`);
            return;
        }

        const message = 'Error saving feedback';
        setErrorMessage(message);
        toast.error(message);
        router.push('/')
    };

     saveFeedback();

   },[callStatus,interviewId,messages,router,type,userId]) 

    const handleCall = async()=>{
        if (isStartingCall.current || callStatus === CallStatus.CONNECTING || callStatus === CallStatus.ACTIVE) {
            return;
        }

        isStartingCall.current = true;
        setErrorMessage(null);
        hadCallError.current = false;
        isEndingCall.current = false;
        setMessages([]);
        updateCallStatus(CallStatus.CONNECTING)

        try {
            const vapi = getVapi();

            if(type === "generate"){
                const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;

                if (!workflowId) {
                    throw new Error('NEXT_PUBLIC_VAPI_WORKFLOW_ID is not configured.');
                }

                await vapi.start(undefined, undefined, undefined, workflowId,{
                    variableValues:{
                        username :userName,
                        userid :userId,
                    }
                })
                // console.log("k",k)
            }else{
                let formattedQuestions='';
                if(questions){
                    formattedQuestions = questions.map((question)=>
                        `- ${question}`
                    ).join('\n');
                }

                await vapi.start(interviewer,{
                    variableValues:{
                        questions:formattedQuestions
                    }
                })
                // console.log("va",va)
            }

            updateCallStatus(CallStatus.ACTIVE)
        } catch (error) {
            const message = getErrorMessage(error);

            console.error('Failed to start call:', getErrorDetails(error));
            setErrorMessage(message);
            updateCallStatus(CallStatus.INACTIVE);
            toast.error(message);
        } finally {
            isStartingCall.current = false;
        }
    }
    const handleDisconnect = async()=>{
        if (isEndingCall.current || callStatus !== CallStatus.ACTIVE) {
            return;
        }

        hadCallError.current = false;
        isEndingCall.current = true;
        updateCallStatus(CallStatus.ENDING)

        try {
            const vapi = getVapi();
            await vapi.stop()
            updateCallStatus(CallStatus.FINISHED)
        } catch (error) {
            const message = getErrorMessage(error);

            isEndingCall.current = false;
            console.error('Failed to stop call:', getErrorDetails(error));
            setErrorMessage(message);
            updateCallStatus(CallStatus.INACTIVE);
            toast.error(message);
        }
    }
    const latestMessage = messages[messages.length -1 ]?.content;
    // console.log(latestMessage,"latest mesa")
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
    {errorMessage && (
        <p className='mt-4 text-center text-sm text-destructive'>{errorMessage}</p>
    )}
    <div className='w-full flex justify-center'>
{callStatus !== 'ACTIVE'? (
    <button className='relative btn-call' onClick={handleCall} disabled={callStatus === CallStatus.CONNECTING || callStatus === CallStatus.ENDING}>
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
