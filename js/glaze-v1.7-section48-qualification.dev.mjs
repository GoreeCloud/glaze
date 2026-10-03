/* Glaze V1.7 - v1.3 Section 48 qualification-control foundation.
 *
 * Extends the frozen v1.2/dev.39 qualification matrix without rewriting its
 * evidence or lifecycle authority. Matrix completeness permits governed review
 * only; it does not establish Section 48 acceptance, Seal, Anchor, consumer
 * eligibility, deployment acceptance, or production acceptance.
 */

import {
  createGlazeV17AcceptanceMatrix,
  glazeV17AcceptanceDevelopmentContract
} from './glaze-v1.7-acceptance.dev.mjs';
import {glazeV17ExpressionSystemDevelopmentContract} from './glaze-v1.7-expression-system.dev.mjs';
import {glazeV17ProviderAdaptiveSurfacesDevelopmentContract} from './glaze-v1.7-provider-adaptive-surfaces.dev.mjs';
import {glazeV17AdaptiveExperienceSurfacesDevelopmentContract} from './glaze-v1.7-adaptive-experience-surfaces.dev.mjs';

const defs=[
 ['workspace-continuity-v13','Workspace continuity','required',[['machine'],['rendered','device'],['human']]],
 ['compact-surface-v13','Compact surface behavior','required',[['machine'],['rendered','device']]],
 ['agent-activity-authority-v13','Agent Activity authority','required',[['machine'],['human']]],
 ['privacy-attention-authority-v13','Privacy Attention authority','required',[['machine'],['human']]],
 ['accessibility-presentation-v13','Accessibility Presentation','required',[['machine'],['assistive-technology'],['human']]],
 ['creative-state-separation-v13','Creative state separation','required',[['machine'],['human']]],
 ['compare-neutrality-v13','Compare neutrality','required',[['machine'],['human']]],
 ['care-authority-v13','Care authority','required',[['machine'],['human']]],
 ['large-text-reflow-v13','Large text reflow','required',[['machine'],['rendered','device'],['human']]],
 ['forced-colors-v13','Forced Colors','required',[['machine'],['rendered'],['human']]],
 ['keyboard-continuity-v13','Keyboard continuity','required',[['machine'],['human']]],
 ['switch-access-v13','Switch access','required',[['assistive-technology'],['human']]],
 ['voice-access-v13','Voice access','required',[['assistive-technology'],['human']]],
 ['compact-device-behavior-v13','Representative compact device behavior','required',[['device'],['rendered']]],
 ['provider-integration-v13','Provider integration','required',[['machine'],['device','human']]],
 ['privacy-security-integration-v13','Privacy and security integration','required',[['machine'],['human']]],
 ['cross-platform-expression-v13','Cross-platform expression consistency','required',[['rendered','device'],['human']]],
 ['performance-v13','Measured performance','required',[['performance']]],
 ['energy-v13','Energy behavior where applicable','conditional',[['energy'],['device']]],
 ['human-visual-v13','Human visual and interaction review','required',[['human']]],
 ['artifact-provenance-v13','V1.3 artifact provenance','required',[['provenance']]]
];
export const SECTION48_ACCEPTANCE_LANES=Object.freeze(defs.map(d=>Object.freeze({
  id:d[0],label:d[1],applicability:d[2],
  evidenceGroups:Object.freeze(d[3].map(g=>Object.freeze([...g]))),
  evidenceTypes:Object.freeze([...new Set(d[3].flat())])
})));

const LANE_IDS=new Set(SECTION48_ACCEPTANCE_LANES.map(l=>l.id));
const CONDITIONAL_IDS=new Set(SECTION48_ACCEPTANCE_LANES.filter(l=>l.applicability==='conditional').map(l=>l.id));
const EVIDENCE_TYPES=new Set(['machine','rendered','device','human','assistive-technology','performance','energy','provenance']);
const TOP_KEYS=new Set([
  'exactRevision','v12Evidence','v12Applicability','v12NotApplicableJustifications',
  'section48Evidence','section48Applicability','section48NotApplicableJustifications'
]);
const RECORD_KEYS=new Set(['id','verified','revision','evidenceType','reference']);

function plainObject(v){
  if(v===null||typeof v!=='object'||Array.isArray(v))return false;
  const proto=Object.getPrototypeOf(v);
  return proto===Object.prototype||proto===null;
}
function text(v){return String(v??'').trim();}
function validRevision(v){return /^[0-9a-f]{40}$/.test(text(v));}
function rejectUnknownKeys(input,allowed,label){
  for(const key of Object.keys(input))if(!allowed.has(key))throw new RangeError(label+' contains unsupported key: '+key);
}
function validateMapKeys(map,label){
  if(!plainObject(map))return;
  for(const key of Object.keys(map))if(!LANE_IDS.has(key))throw new RangeError(label+' references unknown Section 48 lane: '+key);
}
function normalizeRecords(records,exactRevision){
  const out=new Map();
  if(records===undefined)return out;
  if(!Array.isArray(records))throw new TypeError('Section 48 evidence must be an array');
  if(records.length>1000)throw new RangeError('Section 48 evidence exceeds bounded record limit');
  for(const raw of records){
    if(!plainObject(raw))throw new TypeError('Each Section 48 evidence record must be a plain object');
    rejectUnknownKeys(raw,RECORD_KEYS,'Section 48 evidence record');
    const id=text(raw.id);
    if(!LANE_IDS.has(id))throw new RangeError('Unknown Section 48 qualification lane: '+id);
    const evidenceType=text(raw.evidenceType).toLowerCase();
    if(!EVIDENCE_TYPES.has(evidenceType))throw new RangeError('Unsupported Section 48 evidence type: '+evidenceType);
    const revision=validRevision(raw.revision)?text(raw.revision):null;
    const record=Object.freeze({
      externallyVerified:raw.verified===true,evidenceRevision:revision,evidenceType,
      evidenceReference:text(raw.reference)||null,
      revisionMatches:Boolean(exactRevision&&revision===exactRevision)
    });
    const list=out.get(id)||[]; list.push(record); out.set(id,list);
  }
  return out;
}
function groupSatisfied(group,records){
  return records.some(r=>r.externallyVerified&&r.revisionMatches&&r.evidenceReference&&group.includes(r.evidenceType));
}
function failure(exactRevision,groups,records){
  if(!exactRevision)return 'matrix-exact-revision-missing';
  if(records.length===0)return 'missing-evidence';
  if(records.some(r=>r.externallyVerified&&!r.evidenceRevision))return 'evidence-revision-invalid';
  if(records.some(r=>r.externallyVerified&&r.evidenceRevision&&!r.revisionMatches))return 'evidence-revision-mismatch';
  if(records.some(r=>r.externallyVerified&&r.revisionMatches&&!r.evidenceReference))return 'evidence-reference-missing';
  const allowed=[...new Set(groups.flat())];
  if(records.some(r=>r.externallyVerified&&r.revisionMatches&&r.evidenceReference&&!allowed.includes(r.evidenceType)))return 'evidence-type-not-allowed';
  if(records.some(r=>r.externallyVerified!==true))return 'evidence-not-externally-verified';
  return 'required-evidence-group-unsatisfied';
}
function section48Matrix(input,exactRevision){
  const applicability=plainObject(input.section48Applicability)?input.section48Applicability:{};
  const justifications=plainObject(input.section48NotApplicableJustifications)?input.section48NotApplicableJustifications:{};
  validateMapKeys(applicability,'Section 48 applicability');
  validateMapKeys(justifications,'Section 48 not-applicable justification');
  for(const [id,value] of Object.entries(applicability)){
    if(value!==true&&value!==false)throw new TypeError('Section 48 applicability values must be boolean: '+id);
    if(value===false&&!CONDITIONAL_IDS.has(id))throw new RangeError('Required Section 48 lane cannot be marked not applicable: '+id);
  }
  const evidence=normalizeRecords(input.section48Evidence,exactRevision);
  const lanes=SECTION48_ACCEPTANCE_LANES.map(def=>{
    const applicable=applicability[def.id]!==false;
    const records=evidence.get(def.id)||[];
    const justification=text(justifications[def.id]);
    if(!applicable){
      return Object.freeze({
        id:def.id,label:def.label,applicability:def.applicability,applicable:false,
        status:justification.length>=20?'not-applicable-justified':'unverified',
        requiredEvidenceGroups:def.evidenceGroups,failureReason:justification.length>=20?null:'not-applicable-requires-specific-justification'
      });
    }
    const groupResults=def.evidenceGroups.map(group=>Object.freeze({
      allowedEvidenceTypes:group,satisfied:groupSatisfied(group,records)
    }));
    const status=Boolean(exactRevision)&&groupResults.every(g=>g.satisfied)?'externally-verified':'unverified';
    return Object.freeze({
      id:def.id,label:def.label,applicability:def.applicability,applicable:true,status,
      requiredEvidenceGroups:def.evidenceGroups,evidenceGroupResults:Object.freeze(groupResults),
      failureReason:status==='externally-verified'?null:failure(exactRevision,def.evidenceGroups,records)
    });
  });
  const blocking=lanes.filter(l=>!['externally-verified','not-applicable-justified'].includes(l.status));
  return Object.freeze({
    lanes:Object.freeze(lanes),laneCount:lanes.length,
    externallyVerifiedCount:lanes.filter(l=>l.status==='externally-verified').length,
    notApplicableJustifiedCount:lanes.filter(l=>l.status==='not-applicable-justified').length,
    unverifiedCount:lanes.filter(l=>l.status==='unverified').length,
    evidenceInventoryComplete:Boolean(exactRevision)&&blocking.length===0,
    blockingLaneIds:Object.freeze(blocking.map(l=>l.id))
  });
}

export function createGlazeV17V13QualificationMatrix(input={}){
  if(!plainObject(input))throw new TypeError('V1.7 v1.3 qualification input must be a plain object');
  rejectUnknownKeys(input,TOP_KEYS,'V1.7 v1.3 qualification input');
  const exactRevision=validRevision(input.exactRevision)?text(input.exactRevision):null;
  const v12=createGlazeV17AcceptanceMatrix({
    exactRevision,
    evidence:input.v12Evidence,
    applicability:input.v12Applicability,
    notApplicableJustifications:input.v12NotApplicableJustifications
  });
  const section48=section48Matrix(input,exactRevision);
  const complete=v12.evidenceInventoryComplete&&section48.evidenceInventoryComplete;
  return Object.freeze({
    version:'1.7.0-dev.43',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
    planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),exactRevision,
    retainedV12:Object.freeze({version:glazeV17AcceptanceDevelopmentContract.version,laneCount:v12.laneCount,
      evidenceInventoryComplete:v12.evidenceInventoryComplete,blockingLaneIds:v12.blockingLaneIds}),
    section48,
    totalLaneCount:v12.laneCount+section48.laneCount,
    evidenceInventoryComplete:complete,
    readyForGovernedQualificationReview:complete,
    blockingLaneIds:Object.freeze([
      ...v12.blockingLaneIds.map(id=>'v1.2:'+id),
      ...section48.blockingLaneIds.map(id=>'v1.3:'+id)
    ]),
    authority:Object.freeze({
      evidenceManufactured:false,externalEvidenceTrustInferred:false,staleEvidenceAccepted:false,
      mismatchedRevisionAccepted:false,missingEvidenceInferredPassing:false,
      matrixCompletionEqualsSection48Acceptance:false,matrixCompletionEqualsV17Acceptance:false,
      section48Complete:false,v17AcceptanceEstablished:false,sealStatusGranted:false,anchorStatusGranted:false,
      stableStatusGranted:false,consumerEligibilityGranted:false,lifecyclePromotionAutomatic:false,
      deploymentAcceptanceGranted:false,productionAcceptanceGranted:false
    })
  });
}

export const glazeV17Section48QualificationDevelopmentContract=Object.freeze({
  version:'1.7.0-dev.43',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
  planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),
  retainedV12AcceptanceVersion:glazeV17AcceptanceDevelopmentContract.version,
  expressionSystemVersion:glazeV17ExpressionSystemDevelopmentContract.version,
  providerAdaptiveSurfacesVersion:glazeV17ProviderAdaptiveSurfacesDevelopmentContract.version,
  adaptiveExperienceSurfacesVersion:glazeV17AdaptiveExperienceSurfacesDevelopmentContract.version,
  section48Lanes:SECTION48_ACCEPTANCE_LANES,section48LaneCount:SECTION48_ACCEPTANCE_LANES.length,
  totalLaneCount:glazeV17AcceptanceDevelopmentContract.laneCount+SECTION48_ACCEPTANCE_LANES.length,
  conditionalSection48Lanes:Object.freeze([...CONDITIONAL_IDS]),exactRevisionRequired:true,
  allEvidenceGroupsRequired:true,missingEvidenceMayInferPass:false,revisionMismatchMayPass:false,
  matrixCompletionEqualsSection48Acceptance:false,matrixCompletionEqualsV17Acceptance:false,
  section48SourceScopeImplemented:true,section48QualificationControlImplemented:true,section48Complete:false,
  lifecyclePromotionAutomatic:false,authorityBoundary:'qualification-control-only'
});
