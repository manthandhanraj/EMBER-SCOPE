"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useSyncExternalStore} from "react";
type Ctx={mode:"kid"|"pro";setMode:(mode:"kid"|"pro")=>void;gentle:boolean;setGentle:(value:boolean)=>void;reducedMotion:boolean;found:string[];discover:(id:string)=>void};
const Context=createContext<Ctx>({mode:"pro",setMode:()=>{},gentle:false,setGentle:()=>{},reducedMotion:false,found:[],discover:()=>{}});
export const useExplorer=()=>useContext(Context);
let memoryPaused=false;
const serverPreference=()=>false;
function readPaused(){try{const value=localStorage.getItem("emberscope-motion-paused");return value===null?memoryPaused:value==="true";}catch{return memoryPaused;}}
function subscribePaused(notify:()=>void){window.addEventListener("storage",notify);window.addEventListener("emberscope:motion",notify);return ()=>{window.removeEventListener("storage",notify);window.removeEventListener("emberscope:motion",notify);};}
const readReduced=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function subscribeReduced(notify:()=>void){const media=window.matchMedia("(prefers-reduced-motion: reduce)");media.addEventListener("change",notify);return ()=>media.removeEventListener("change",notify);}
/** Retained tools share a persistent motion preference and follow system accessibility settings. */
export function ResearchProvider({children}:{children:React.ReactNode}){
 const paused=useSyncExternalStore(subscribePaused,readPaused,serverPreference);
 const reducedMotion=useSyncExternalStore(subscribeReduced,readReduced,serverPreference);
 const setGentle=useCallback((value:boolean)=>{memoryPaused=value;try{localStorage.setItem("emberscope-motion-paused",String(value));}catch{}window.dispatchEvent(new Event("emberscope:motion"));},[]);
 const gentle=paused||reducedMotion;
 useEffect(()=>{document.documentElement.dataset.motion=gentle?"gentle":"full";},[gentle]);
 const value=useMemo<Ctx>(()=>({mode:"pro",setMode:()=>{},gentle,setGentle,reducedMotion,found:[],discover:()=>{}}),[gentle,setGentle,reducedMotion]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
