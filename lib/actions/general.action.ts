import { db } from "@/firebase/admin";

export async function getInterviewsByUserId(userId:string): Promise<Interview[] | null> {
    try {
        // console.log(userId,"id")
        const interviews = await db.collection('interviews').where('userId','==',userId).orderBy('createdAt','desc').get()
        // if(interviews.empty){
        //     return null
        // }
        return interviews.docs.map((doc)=>({
             
                ...doc.data(),
                id:doc.id,
            
        })) as Interview[]
        // return interviewData 
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function getLatestInterviews(params:GetLatestInterviewsParams): Promise<Interview[] | null> {
    const {userId,limit=20} = params;
    try {
        const interviews = await db.collection('interviews').where('userId','!=',userId).orderBy('createdAt','desc').where('finalized','==',true)
        .limit(limit).
        get()
        // if(interviews.empty){
        //     return null
        // }
        return interviews.docs.map((doc)=>({
             
                ...doc.data(),
                id:doc.id,
            
        })) as Interview[]
        // return interviewData 
    } catch (error) {
        console.error(error)
        return null
    }
}
export async function getInterviewsById(id:string): Promise<Interview | null> {
    try {
        // console.log(userId,"id")
        const interview = await db.collection('interviews').doc(id).get()
        // if(interviews.empty){
        //     return null
        // }
        return interview.data() as Interview | null
        // return interviewData 
    } catch (error) {
        console.error(error)
        return null
    }
}