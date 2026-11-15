export function Glyph({name,className}:{name:string;className?:string}){
 const paths:Record<string,React.ReactNode>={
  flame:<><path d="M13 3c1 5 6 6 6 11a7 7 0 0 1-14 0c0-3 2-6 5-8 0 3 1 4 2 5 2-3 2-5 1-8Z"/><path d="M12 13c-2 2-3 3-3 5a3 3 0 0 0 6 0c0-2-2-4-3-5Z"/></>,
  network:<><circle cx="12" cy="12" r="3"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/><path d="m6 7 4 3m4 0 4-3M6 18l4-4m4 0 4 4"/></>,
  book:<><path d="M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H3Zm18 0h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-3h5Z"/></>,
  compare:<><path d="M5 3v18M19 3v18M2 8h6m8 8h6M9 5l6 4-6 4m6 0-6 4 6 4"/></>,
  spark:<><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></>,
  file:<><path d="M5 3h9l5 5v13H5Z"/><path d="M14 3v6h5M8 13h8m-8 4h6"/></>,
  arrow:<><path d="M4 12h16m-6-6 6 6-6 6"/></>,
  external:<><path d="M14 3h7v7m0-7L10 14M9 4H4v16h16v-5"/></>,
  search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
  pause:<><path d="M8 5v14m8-14v14"/></>,
  play:<><path d="m8 4 12 8-12 8Z"/></>,
  shield:<><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></>,
  target:<><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3"/></>,
 };
 return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]??paths.file}</svg>;
}
