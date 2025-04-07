import Vapi from "@vapi-ai/web";
// import { useState, useEffect } from "react";

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || ""); // Get Public Token from Dashboard > Accounts Page

// function VapiAssistant() {
//   const [callStatus, setCallStatus] = useState("inactive");
//   const start = async () => {
//     setCallStatus("loading");
//     const response = vapi.start("your-assistant-id");
//   };
//   const stop = () => {
//     setCallStatus("loading");
//     vapi.stop();
//   };
//   useEffect(() => {
//     vapi.on("call-start", () => setCallStatus("active"));
//     vapi.on("call-end", () => setCallStatus('inactive'));
    
//     return () => vapi.removeAllListeners();
//   }, [])
//   return (
//     <div>
//       {callStatus === "inactive" ? (<button onClick={start}>Start</button>) : null}
//       {callStatus === "loading" ? <i>Loading...</i> : null}
//       {callStatus === "active" ? (<button onClick={stop}>Stop</button>) : null}
//     </div>
//   );
// }

