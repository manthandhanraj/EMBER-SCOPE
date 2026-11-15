import type {Investigation} from "./research.ts";

export const HABITATS = {
 spacecraft:{label:"Spacecraft",focus:"Cabin-scale fire growth, escape constraints, smoke transport and ventilation control.",priorities:["scale","smoke","ventilation","suppression"],preferences:{saffire:1,same:.85,"same-r":.85,bass2:.65,flex:.65,sofie:.7},limits:"Cargo-vehicle tests do not establish a crewed cabin's detector or suppression performance."},
 station:{label:"Space station",focus:"Long-duration occupied compartments, low-speed ventilation, material screening and early smoke detection.",priorities:["detection","airflow","materials","long-duration"],preferences:{same:1,"same-r":1,bass2:.95,sofie:.85,saffire:.6,flex:.55},limits:"ISS experiments use specific racks and ducts; a whole station has different airflow paths and compartment boundaries."},
 "lunar-habitat":{label:"Lunar habitat",focus:"Partial-gravity material flammability, candidate atmospheres and growth/extinction gaps.",priorities:["partial-gravity","oxygen","pressure","materials"],preferences:{luci:1,fm2:.85,sofie:.8,bass2:.65,saffire:.55,same:.5,"same-r":.5},limits:"A lunar analogue and a planned lunar experiment are not measured Moon-surface habitat performance."},
 "martian-habitat":{label:"Martian habitat",focus:"Martian partial-gravity transfer gaps, atmosphere selection and material screening.",priorities:["partial-gravity","pressure","oxygen","materials"],preferences:{luci:.6,fm2:.55,sofie:.9,bass2:.8,saffire:.55,same:.5,"same-r":.5},limits:"Lunar gravity does not match Martian gravity. Orbital solid-fuel data remains analogous when Martian conditions are requested."},
 rover:{label:"Pressurized rover",focus:"Compact enclosure, localized materials, smoke sensing, limited suppressant inventory and ventilation interruption.",priorities:["detection","confinement","materials","ventilation"],preferences:{same:1,"same-r":1,bass2:.95,sofie:.7,flex:.65,saffire:.35,luci:.55},limits:"Rover geometry, local ventilation and gravity must be supplied; a large cargo-vehicle burn does not define a rover fire scenario."},
} as const;
export function habitatContext(environment:string){return HABITATS[environment as keyof typeof HABITATS]??HABITATS.spacecraft;}
/** Disclosed project research priorities; these are not measured habitat compatibility. */
export function habitatPreference(study:Investigation,environment:string){
 const profile=habitatContext(environment);
 const overrides:Record<string,number>=profile.preferences;
 const value=overrides[study.id]??(study.id==="efield"?.1:study.phase==="gas"?.25:.4);
 return {value,label:profile.label,focus:profile.focus,limits:profile.limits};
}
