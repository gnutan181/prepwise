"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// import { Sign } from "crypto"
const ONE_WEEK = 60 * 60 * 24 * 7 
export async function signUp(params:SignUpParams) {
 const {uid , name ,email} = params;
 try {
    const userRecord = await db.collection('users').doc(uid).get()
    // console.log(userRecord,"userrecord")
    if(userRecord.exists){
        return {
            success :false,
            message :"User already exists",
        }
    }
    await db.collection('users').doc(uid).set({ 
        name,email})
        return {
            success: true,
            message: "Account created successfully. Please sign in.",
          };
 } catch (error : any) {
    console.error("Error signing up user:", error);
    if(error.code === 'auth/email-already-exists'){
        return {
            success :false,
            message :"Email already exists",
        }
    }
    return {
        succes :false,
        message : 'Failed to create an account',
    }
 }   
}

export async function signIn(params:SignInParams) {
    const {email,idToken} = params;
    try {
        const userRecord = await auth.getUserByEmail(email)
        if(!userRecord){
            return {
                success :false,
                message :"User does not exist. Create an account",
            }
        }
        await setSessionCookie(idToken)
    } catch (e) {
        console.log(e)
        return {
            success :false,
            message :"Failed to sign in",
        }

    }
}

// export async function signIn(params:SignInParams) {
export async function setSessionCookie(idToken : string){
    const cookieStore = await cookies()
    const sessionCookie = await auth.createSessionCookie(idToken,
         {expiresIn: ONE_WEEK*1000})

         cookieStore.set('session',sessionCookie,{
            maxAge:ONE_WEEK,
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            path:'/',
            sameSite:'lax',
         } )
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies()
    // console.log(cookieStore,"cookiestore")
    const sessionCookie = cookieStore.get('session')?.value;
    // console.log(sessionCookie,"sessionCookei")
    if(!sessionCookie){
        return null
    }
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie , true);
        // console.log(decodedClaims,"decodedClaims")
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get()
        if(!userRecord.exists){
            return null
        }
        return {
            ...userRecord.data(),
            id:userRecord.id,
        } as User;
    } catch (error) {
        console.log(error)
        return null
    }
}

export  async function isAuthenticated(){
    const user  = await getCurrentUser()
    // console.log(user,"user")
    return !!user;
    // !{name:'richappy'} -> false -> !false -> true
    // first ! convert into boolean and ! convert into boolean again with actual value in a boolean -> this method is used  check if existance or not into boolean 

}