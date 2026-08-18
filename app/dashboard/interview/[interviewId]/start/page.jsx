"use client"
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import QuestionsSection from './_components/QuestionsSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function StartInterview({params}) {
    const resolvedParams = React.use(params);
    const interviewId = resolvedParams?.interviewId;

    const [interviewData,setInterviewData]=useState();
    const [MockInterviewQuestion,setMockInterviewQuestion]=useState();
    const [activeQuestionIndex,setActiveQuestionIndex]=useState(0);
    useEffect(()=>{
        if (!interviewId) return;
        GetInterviewDetails();

    },[interviewId]);

     /**
     * Used to Get Interview Details by MockId/Interview Id
     */
     
     const GetInterviewDetails=async()=>{
        const result=await db.select().from(MockInterview)
        .where(eq(MockInterview.mockId,interviewId))
        
        

        const jsonMockResp=JSON.parse(result[0].jsonMockResp)
        console.log(jsonMockResp)
        setMockInterviewQuestion(jsonMockResp);
        setInterviewData(result[0]);

        
    }
  return (
    <div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
            {/*Questions */}
            <QuestionsSection 
            MockInterviewQuestion={MockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
            />

            {/*Video/ Audio Recording */}
            <RecordAnswerSection
            MockInterviewQuestion={MockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
            interviewData={interviewData}
            />

        </div>
        <div className='flex justify-end gap-6'>
         {activeQuestionIndex>0&&  
         <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex-1)}>Previous Question</Button>}
         {activeQuestionIndex!=MockInterviewQuestion?.length-1&& 
         <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex+1)}>Next Question</Button>}
        {activeQuestionIndex==MockInterviewQuestion?.length-1&& 
        <Link href={'/dashboard/interview/'+interviewData?.mockId+"/feedback"}>
        <Button>End Interview</Button>
        </Link>}
        </div>
    </div>
  )
}

export default StartInterview