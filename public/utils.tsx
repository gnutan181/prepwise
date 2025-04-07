// import { interviewCovers, mappings } from "@/constants";
// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

// const normalizeTechName = (tech: string) => {
//   const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
//   return mappings[key as keyof typeof mappings];
// };

// const checkIconExists = async (url: string) => {
//   try {
//     const response = await fetch(url, { method: "HEAD" });
//     return response.ok; // Returns true if the icon exists
//   } catch {
//     return false;
//   }
// };

// export const getTechLogos = async (techArray: string[]) => {
//   const logoURLs = techArray.map((tech) => {
//     const normalized = normalizeTechName(tech);
//     return {
//       tech,
//       url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
//     };
//   });

//   const results = await Promise.all(
//     logoURLs.map(async ({ tech, url }) => ({
//       tech,
//       url: (await checkIconExists(url)) ? url : "/tech.svg",
//     }))
//   );

//   return results;
// };


// ```

// </details>

// <details>
// <summary><code>Generate questions prompt (/app/api/vapi/generate/route.tsx):</code></summary>

// ```javascript
// `Prepare questions for a job interview.
//         The job role is ${role}.
//         The job experience level is ${level}.
//         The tech stack used in the job is: ${techstack}.
//         The focus between behavioural and technical questions should lean towards: ${type}.
//         The amount of questions required is: ${amount}.
//         Please return only the questions, without any additional text.
//         The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
//         Return the questions formatted like this:
//         ["Question 1", "Question 2", "Question 3"]
        
//         Thank you! <3
//     `;
// ```

// </details>

// <details>
// <summary><code>Generate feedback prompt (lib/actions/general.action.ts):</code></summary>

// ```javascript
// prompt: `
//         You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
//         Transcript:
//         ${formattedTranscript}

//         Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
//         - **Communication Skills**: Clarity, articulation, structured responses.
//         - **Technical Knowledge**: Understanding of key concepts for the role.
//         - **Problem-Solving**: Ability to analyze problems and propose solutions.
//         - **Cultural & Role Fit**: Alignment with company values and job role.
//         - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
//         `,
// system:
//         "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
// ```

// </details>

// <details>
// <summary><code>Display feedback (app/(root)/interview/[id]/feedback/page.tsx):</code></summary>

// ```javascript
//     <section className="section-feedback">
//       <div className="flex flex-row justify-center">
//         <h1 className="text-4xl font-semibold">
//           Feedback on the Interview -{" "}
//           <span className="capitalize">{interview.role}</span> Interview
//         </h1>
//       </div>

//       <div className="flex flex-row justify-center">
//         <div className="flex flex-row gap-5">
//           <div className="flex flex-row gap-2 items-center">
//             <Image src="/star.svg" width={22} height={22} alt="star" />
//             <p>
//               Overall Impression:{" "}
//               <span className="text-primary-200 font-bold">
//                 {feedback?.totalScore}
//               </span>
//               /100
//             </p>
//           </div>

//           <div className="flex flex-row gap-2">
//             <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
//             <p>
//               {feedback?.createdAt
//                 ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
//                 : "N/A"}
//             </p>
//           </div>
//         </div>
//       </div>

//       <hr />

//       <p>{feedback?.finalAssessment}</p>

//       <div className="flex flex-col gap-4">
//         <h2>Breakdown of the Interview:</h2>
//         {feedback?.categoryScores?.map((category, index) => (
//           <div key={index}>
//             <p className="font-bold">
//               {index + 1}. {category.name} ({category.score}/100)
//             </p>
//             <p>{category.comment}</p>
//           </div>
//         ))}
//       </div>

//       <div className="flex flex-col gap-3">
//         <h3>Strengths</h3>
//         <ul>
//           {feedback?.strengths?.map((strength, index) => (
//             <li key={index}>{strength}</li>
//           ))}
//         </ul>
//       </div>

//       <div className="flex flex-col gap-3">
//         <h3>Areas for Improvement</h3>
//         <ul>
//           {feedback?.areasForImprovement?.map((area, index) => (
//             <li key={index}>{area}</li>
//           ))}
//         </ul>
//       </div>

//       <div className="buttons">
//         <Button className="btn-secondary flex-1">
//           <Link href="/" className="flex w-full justify-center">
//             <p className="text-sm font-semibold text-primary-200 text-center">
//               Back to dashboard
//             </p>
//           </Link>
//         </Button>

//         <Button className="btn-primary flex-1">
//           <Link
//             href={`/interview/${id}`}
//             className="flex w-full justify-center"
//           >
//             <p className="text-sm font-semibold text-black text-center">
//               Retake Interview
//             </p>
//           </Link>
//         </Button>
//       </div>
//     </section>
// ```

// </details>

// <details>
// <summary><code>Dummy Interviews:</code></summary>

// ```javascript
// export const dummyInterviews: Interview[] = [
//   {
//     id: "1",
//     userId: "user1",
//     role: "Frontend Developer",
//     type: "Technical",
//     techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
//     level: "Junior",
//     questions: ["What is React?"],
//     finalized: false,
//     createdAt: "2024-03-15T10:00:00Z",
//   },
//   {
//     id: "2",
//     userId: "user1",
//     role: "Full Stack Developer",
//     type: "Mixed",
//     techstack: ["Node.js", "Express", "MongoDB", "React"],
//     level: "Senior",
//     questions: ["What is Node.js?"],
//     finalized: false,
//     createdAt: "2024-03-14T15:30:00Z",
//   },
// ];
// ```

// </details>


// ## <a name="links">🔗 Assets</a>

// Public assets used in the project can be found [here](https://drive.google.com/drive/folders/1DuQ9bHH3D3ZAN_CFKfBgsaB8DEhEdnog?usp=sharing)

// ## <a name="more">🚀 More</a>

// **Advance your skills with Next.js Pro Course**

// Enjoyed creating this project? Dive deeper into our PRO courses for a richer learning adventure. They're packed with
// detailed explanations, cool features, and exercises to boost your skills. Give it a go!

// <a href="https://jsmastery.pro/next15" target="_blank">
//    <img src="https://github.com/user-attachments/assets/b8760e69-1f81-4a71-9108-ceeb1de36741" alt="Project Banner">
// </a>
