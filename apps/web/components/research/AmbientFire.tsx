import s from "./AmbientFire.module.css";

/** Decorative, shared background. It never intercepts input or represents measured fire behavior. */
export function AmbientFire(){
 return <div className={s.backdrop} aria-hidden="true">
  <div className={s.haze}/>
  <svg className={s.flames} viewBox="0 0 1440 800" preserveAspectRatio="none" focusable="false">
   <defs><linearGradient id="emberscope-ambient-fire" x1="0" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">
    <stop offset="0" stopColor="#ffbe64" stopOpacity=".78"/>
    <stop offset=".25" stopColor="#fa6d24" stopOpacity=".52"/>
    <stop offset=".65" stopColor="#d8431e" stopOpacity=".24"/>
    <stop offset="1" stopColor="#ff9d44" stopOpacity="0"/>
   </linearGradient></defs>
   <g fill="url(#emberscope-ambient-fire)">
    <path d="M-100 840C90 720-20 580 100 440C190 335 105 230 160 70C205 280 350 380 275 555C220 700 365 755 320 840Z"/>
    <path d="M170 840C350 690 255 550 375 405C465 290 405 205 480 40C505 245 635 345 555 535C475 705 660 750 625 840Z"/>
    <path d="M430 840C575 740 490 640 605 535C675 465 650 350 720 250C685 425 850 500 775 650C725 750 860 785 840 840Z"/>
    <path d="M720 840C870 725 785 625 900 485C975 395 920 270 1010 130C995 345 1140 445 1060 610C1005 745 1150 780 1120 840Z"/>
    <path d="M1010 840C1165 715 1075 560 1205 410C1290 310 1210 180 1290 30C1300 245 1450 350 1360 550C1295 710 1470 765 1440 840Z"/>
    <path d="M1300 840C1440 740 1370 610 1470 505C1540 420 1470 300 1550 205C1525 410 1650 500 1580 665C1540 765 1640 800 1610 840Z"/>
   </g>
  </svg>
  <div className={s.embers}>{Array.from({length:14},(_,i)=><i key={i}/>)}</div>
 </div>;
}
