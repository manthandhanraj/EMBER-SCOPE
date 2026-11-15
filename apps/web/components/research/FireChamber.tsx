import s from "./FireChamber.module.css";
import {Glyph} from "./Glyph";

export function FireChamber(){
 return <figure className={s.chamber} aria-label="Decorative animated combustion chamber. Concept illustration, not a live NASA experiment or a physical simulation.">
  <div className={s.instrument}><span><i/> MICROGRAVITY RESEARCH</span><Glyph name="target"/></div>
  <div className={s.stage}>
   {/* Generated concept artwork; animated flame pixels are clipped independently from the stationary metal chamber. */}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src="/design/ignition-chamber-cutout.png" width="1536" height="1024" alt="Concept illustration of an orange flame floating inside a metal observation chamber" fetchPriority="high" className={s.art}/>
   <div className={s.livingFlame} aria-hidden="true"/>
   <div className={s.flameHeat} aria-hidden="true"><i/><i/><i/><b/></div>
   <div className={s.reticle} aria-hidden="true"><b/><b/><b/><b/></div>
  </div>
  <figcaption><span><i/> CONCEPT ILLUSTRATION</span><span>Decorative flame animation</span></figcaption>
 </figure>;
}
