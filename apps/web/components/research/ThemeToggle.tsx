"use client";
import {useState} from "react";
import s from "./ResearchNavigation.module.css";
export function ThemeToggle({initialTheme}:{initialTheme:"dark"|"light"}){
 const [theme,setTheme]=useState(initialTheme);
 function toggle(){const next=theme==="dark"?"light":"dark";setTheme(next);document.documentElement.dataset.theme=next;document.cookie=`emberscope-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;}
 return <button type="button" className={s.theme} onClick={toggle} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`} title={`Switch to ${theme==="dark"?"light":"dark"} mode`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{theme==="dark"?<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>:<path d="M20.5 14A8.7 8.7 0 0 1 10 3.5 8.7 8.7 0 1 0 20.5 14Z"/>}</svg><span>{theme==="dark"?"Light":"Dark"}</span></button>;
}
