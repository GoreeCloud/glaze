#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {V13_SECTION48_QUALIFICATION_LANES} from '../js/glaze-v1.7-v1-3-qualification.dev.mjs';
import {V13_SECTION48_COVERAGE_LANES} from '../js/glaze-v1.7-v1-3-qualification-coverage.dev.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'contracts/v1.7/qualification.v1.3.control-coverage.json'),'utf8'));
const req=(v,m)=>{if(!v)throw new Error(m);};
const expected=['machine','rendered','device','human','assistive-technology','performance','energy','provenance','provider-integration','privacy-security'];
req(data.schemaVersion===1,'coverage schema version drifted');
req(data.recordId==='goreecloud.glaze.v1.7.1.section48-evidence-control-coverage','coverage ID drifted');
req(data.lifecycle==='DevelopmentQualification','coverage lifecycle drifted');
req(data.sourceRevision==='4b9d085a5177b96cc31d4270b38d792a59872e37'&&data.sourceModelVersion==='1.7.0-dev.47','coverage source binding drifted');
req(data.stableBaseline==='1.7.0'&&data.historicalSourceStableBaseline==='1.6.0','coverage Stable binding drifted');
req(JSON.stringify(Object.keys(data.controls).sort())===JSON.stringify([...expected].sort()),'control evidence-type set drifted');
for(const [type,control] of Object.entries(data.controls)){
 req(control.controlEstablished===true,'control not established: '+type);
 req(control.acceptedEvidenceEstablished===false,'coverage record must not claim accepted evidence: '+type);
 req(typeof control.control==='string'&&fs.existsSync(path.join(root,control.control)),'control path missing: '+type);
 req(typeof control.mode==='string'&&control.mode.length>0,'control mode missing: '+type);
}
const lanes=[...V13_SECTION48_QUALIFICATION_LANES,...V13_SECTION48_COVERAGE_LANES];
const missing=[]; const requiredTypes=new Set();
for(const lane of lanes){
 for(const group of lane.evidenceGroups){
  for(const type of group)requiredTypes.add(type);
  const controlled=group.some(type=>data.controls[type]?.controlEstablished===true);
  if(!controlled)missing.push({laneId:lane.id,group});
 }
}
req(missing.length===0,'Section 48 evidence group lacks control: '+JSON.stringify(missing));
req(JSON.stringify([...requiredTypes].sort())===JSON.stringify([...expected].sort()),'qualification model evidence types drifted from coverage registry');
req(data.controlCoverageComplete===true,'controlCoverageComplete must be true after exhaustive mapping');
for(const key of ['acceptedEvidenceInventoryComplete','section48Accepted','v171AcceptanceEstablished'])req(data[key]===false,'authority overclaim: '+key);
console.log('Glaze V1.7.1 Section 48 evidence-control coverage: PASS');
console.log('Section 48 lanes covered by control plane: '+lanes.length);
console.log('Required evidence types with controls: '+expected.length+' / '+expected.length);
console.log('Accepted evidence inventory complete: false');
console.log('Section 48 accepted: false');
