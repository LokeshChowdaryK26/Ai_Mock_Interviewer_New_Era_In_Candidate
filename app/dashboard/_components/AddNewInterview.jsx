"use client"
import React , {useState} from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { generateChatResponse } from '@/utils/GeminiAIModal'
import { LoaderCircle } from 'lucide-react'
import { MockInterview } from '@/utils/schema'
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { db } from '@/utils/db'
import { useRouter } from 'next/navigation'
  

function AddNewInterview() {
    const [openDailog,setOpenDailog]=useState(false)
    const [jobPosition,setJobPosition]=useState();
    const [jobDesc,setJobDesc]=useState();
    const [jobExperience,setJobExperience]=useState();
    const [loading,setLoading]=useState(false);
    const [jsonResponse,setJsonResponse]=useState([]);
    const [errorMessage,setErrorMessage]=useState('');
    const router=useRouter();
    const {user}=useUser();
    const onSubmit=async(e)=>{
            e.preventDefault();
            setLoading(true);
            setErrorMessage('');
            console.log(jobPosition,jobDesc,jobExperience);

            try {
                const InputPromt="Job position: "+jobPosition+", Job Description: "+jobDesc+", Years of Experience : "+jobExperience+" , Depends on Job Position,  Job Description & Years of Experience give us "+process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT+" Interview question and Answer in JSON format, Give us question and answer field on JSON";
                const resultText = await generateChatResponse(InputPromt);
                const MockJsonResp=resultText.replace('```json','').replace('```','').trim();
                console.log(JSON.parse(MockJsonResp));
                setJsonResponse(MockJsonResp);

                if(MockJsonResp)
                {
                    const resp=await db.insert(MockInterview)
                    .values({
                        mockId:uuidv4(),
                        jsonMockResp:MockJsonResp,
                        jobPosition:jobPosition,
                        jobDesc:jobDesc,
                        jobExperience:jobExperience,
                        createdBy:user?.primaryEmailAddress?.emailAddress,
                        createdAt:moment().format('DD-MM-YYYY')
                    }).returning({mockId:MockInterview.mockId})
                    console.log("Inserted ID:",resp)
                    if(resp)
                    {
                        setOpenDailog(false);
                        router.push('/dashboard/interview/'+resp[0]?.mockId)
                    }
                }
                else{
                    console.log("ERROR");
                    setErrorMessage('The AI could not generate interview questions. Please try again.');
                }
            } catch (error) {
                console.error('AI generation failed:', error);
                setErrorMessage('The interview generator is temporarily busy. Please try again in a moment.');
            } finally {
                setLoading(false);
            }
    }
  return (
    <div>
        <div className='p-10 border rounded-lg bg-secondary
        hover:scale-105 hover:shadow-md cursor-pointer transition-all'
        onClick={()=>setOpenDailog(true)}
        >
            <h2 className='text-lg text-center'>+ Add New </h2>
        </div>
        <Dialog open={openDailog}>
        
        <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Tell us more about your job interviewing</DialogTitle>
            </DialogHeader>

            <div>
              <DialogDescription className="mb-4 text-sm text-slate-600">
                Add Details about your job position/role, job description and years of experience.
              </DialogDescription>

              <form onSubmit={onSubmit}>
                <div>
                  <div className='mt-7 my-3'>
                    <label>Job Role/Job Position</label>
                    <Input placeholder="ex. Full Stack Developer" required
                    onChange={(event)=>setJobPosition(event.target.value)}
                    />
                  </div>
                  <div className='mt-7 my-3'>
                    <label>Job Description/ Tech Stack (In Short)</label>
                    <Textarea placeholder="ex. React,MqSql etc" required
                    onChange={(event)=>setJobDesc(event.target.value)}
                    />
                  </div>
                  <div className=' my-3'>
                    <label>Years of Experience</label>
                    <Input placeholder="ex. 5" type="number"  max="50" required
                    onChange={(event)=>setJobExperience(event.target.value)}
                    />
                  </div>
                </div>
                {errorMessage && (
                  <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {errorMessage}
                  </p>
                )}

                <div className='flex gap-5 justify-end'>
                    <Button type="button" variant="ghost" onClick={()=>setOpenDailog(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading?
                        <> 
                        <LoaderCircle className='animate-spin'/>'Generating from AI'
                        </>:'Start Interview'    
                    }
                        </Button>
                </div>
              </form>
            </div>
        </DialogContent>
        </Dialog>

    </div>
  )
}

export default AddNewInterview