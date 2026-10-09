// Memory-only fixture. No student records or real authentication actions.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { User } from 'firebase/auth';
import { AccountContext } from '../src/auth/AccountContext';
import App from '../src/App';
import '../src/index.css';
const entries=new Map<string,string>([['sp_profile',JSON.stringify({ name:'Test Student', email:'preview@example.test', school:'Preview School', classLevel:'Class 11', group:'Science',board:'Dhaka',examYear:'2027' })]]);
let fail=false;
const storage={ getItem:(key:string)=>entries.get(key)??null,setItem:(key:string,value:string)=>{if(fail&&key==='sp_profile'){fail=false;throw new Error('Preview save failure. Please try again.');} entries.set(key,value);},removeItem:(key:string)=>{entries.delete(key);},clear:()=>entries.clear() };
function Preview(){
 const [version,setVersion]=useState(0);
 return <AccountContext.Provider value={{user:{uid:'isolated-preview',email:'preview@example.test'} as User,storage}}>
   <div className="fixed bottom-12 left-3 z-[80] flex gap-2 rounded-xl border bg-white p-2 text-xs shadow"><button onClick={()=>{fail=true;}}>Fail next profile save</button><button onClick={()=>setVersion(version+1)}>Reload memory copy</button><span>Fake data only</span></div>
   <App key={version}/>
 </AccountContext.Provider>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
