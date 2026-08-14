import 'dotenv/config';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role, SessionStatus } from '@prisma/client';
import { generateHomeworkTasks } from '../server-dist/homework.js';
import { weeklyCheckInQuestions } from '../server-dist/diagnostic.js';

const prisma=new PrismaClient();
const suffix=`${Date.now()}-${Math.random().toString(16).slice(2)}`;
let organizationId='',userId='',studentId='';

try{
  const organization=await prisma.organization.create({data:{name:`IUI E2E ${suffix}`}});organizationId=organization.id;
  const user=await prisma.user.create({data:{email:`checkin-${suffix}@example.invalid`,passwordHash:'integration-only',firstName:'Test',lastName:'Student',role:Role.STUDENT,organizationId}});userId=user.id;
  const student=await prisma.student.create({data:{publicId:`E2E-${suffix}`,userId,firstName:'Test',lastName:'Student'}});studentId=student.id;
  const baselineSession=await prisma.eegSession.create({data:{studentId,status:SessionStatus.COMPLETED,subject:'Первая диагностика',startedAt:new Date(Date.now()-4*86400000),endedAt:new Date(Date.now()-4*86400000+2400000),attentionAvg:60,engagementAvg:62,focusAvg:58,relaxationAvg:55,signalAvg:90,fatigueScore:52}});
  const diagnostic=await prisma.diagnosticAttempt.create({data:{studentId,eegSessionId:baselineSession.id,grade:7,language:'ru',answers:{},sectionScores:{math:50,logic:67,language:67},skillScores:{},gaps:['Уравнения'],strengths:[],recommendations:['Короткая практика'],sectionTimeline:[],totalScore:60,startedAt:baselineSession.startedAt}});
  const startsAt=new Date(Date.now()-3*86400000),tasks=generateHomeworkTasks(7,'ru',['Уравнения'],{math:50,logic:67,language:67});
  const plan=await prisma.homeworkPlan.create({data:{studentId,sourceDiagnosticId:diagnostic.id,startsAt,endsAt:new Date(startsAt.getTime()+7*86400000),focusSkills:['Уравнения'],tasks:{create:tasks}}});
  await prisma.homeworkTask.updateMany({where:{planId:plan.id,dayIndex:{in:[0,1]}},data:{completedAt:new Date()}});
  const preservedTask=await prisma.homeworkTask.findFirstOrThrow({where:{planId:plan.id,dayIndex:0},select:{id:true,prompt:true,correctOption:true}});
  const checkSession=await prisma.eegSession.create({data:{studentId,status:SessionStatus.COMPLETED,subject:'Контрольная диагностика · Неделя 1',startedAt:new Date(Date.now()-720000),endedAt:new Date(),attentionAvg:72,engagementAvg:75,focusAvg:70,relaxationAvg:61,signalAvg:88,fatigueScore:45,samples:{create:Array.from({length:12},(_,index)=>({timestamp:new Date(Date.now()-(12-index)*3000),attention:72,meditation:60,engagement:75,focus:70,relaxation:61,blink:0,signal:88}))}}});
  const questions=weeklyCheckInQuestions(7,'ru',1),answers=Object.fromEntries(questions.map(item=>[item.id,item.correct]));
  const token=jwt.sign({id:userId,role:Role.STUDENT,organizationId},process.env.JWT_SECRET,{expiresIn:'5m'});
  const apiStarted=Date.now();
  const response=await fetch('http://localhost:3001/api/homework-checkins',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({planId:plan.id,eegSessionId:checkSession.id,answers,startedAt:checkSession.startedAt})});
  const body=await response.json();assert.equal(response.status,201,JSON.stringify(body));assert.equal(body.checkIn.totalScore,100);assert.equal(body.checkIn.baselineDelta,40);assert.equal(body.checkIn.attentionDelta,12);assert.equal(body.checkIn.focusDelta,12);assert.equal(body.checkIn.engagementDelta,13);assert.equal(body.checkIn.fatigueDelta,-7);assert.equal(body.checkIn.signalQuality,88);assert.ok(body.checkIn.adaptedTaskCount>0);
  const apiMs=Date.now()-apiStarted,retryStarted=Date.now();
  const retry=await fetch('http://localhost:3001/api/homework-checkins',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({planId:plan.id,eegSessionId:checkSession.id,answers,startedAt:checkSession.startedAt})});
  const retryBody=await retry.json();assert.equal(retry.status,200);assert.equal(retryBody.idempotent,true);assert.equal(retryBody.checkIn.id,body.checkIn.id);
  const stored=await prisma.weeklyCheckIn.findUnique({where:{planId:plan.id}});assert.equal(stored?.id,body.checkIn.id);
  const preservedAfter=await prisma.homeworkTask.findUniqueOrThrow({where:{id:preservedTask.id},select:{prompt:true,correctOption:true,completedAt:true}});assert.equal(preservedAfter.prompt,preservedTask.prompt);assert.equal(preservedAfter.correctOption,preservedTask.correctOption);assert.ok(preservedAfter.completedAt);
  const adaptedPlan=await prisma.homeworkPlan.findUniqueOrThrow({where:{id:plan.id},select:{focusSkills:true,tasks:{where:{dayIndex:{gt:3}},select:{id:true}}}});assert.deepEqual(adaptedPlan.focusSkills,[]);assert.equal(adaptedPlan.tasks.length,stored.adaptedTaskCount);
  console.log(JSON.stringify({ok:true,totalScore:stored.totalScore,baselineDelta:stored.baselineDelta,attentionDelta:stored.attentionDelta,focusDelta:stored.focusDelta,fatigueDelta:stored.fatigueDelta,adaptedTaskCount:stored.adaptedTaskCount,idempotent:true,apiMs,retryMs:Date.now()-retryStarted}));
}finally{
  if(studentId)await prisma.student.deleteMany({where:{id:studentId}});
  if(userId)await prisma.user.deleteMany({where:{id:userId}});
  if(organizationId)await prisma.organization.deleteMany({where:{id:organizationId}});
  await prisma.$disconnect();
}
