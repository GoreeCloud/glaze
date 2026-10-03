import {readFileSync} from 'node:fs';
import {
  resolveGlazeVisualMotionDirectionV12,
  glazeV17VisualMotionDirectionDevelopmentContract,
  VISUAL_MOTION_ADVANCEMENT_OBJECTIVES
} from '../js/glaze-v1.7-visual-motion-direction.dev.mjs';
import {glazeV17CrossDeviceConsistencyDevelopmentContract}
  from '../js/glaze-v1.7-cross-device-consistency.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const json=path=>JSON.parse(read(path));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/visual-motion-direction.dev.json');
const schema=json('schemas/v1.7-visual-motion-direction.schema.json');
const tokens=json('tokens/glaze-v1.7-visual-motion-direction.dev.json');
const lifecycle=json('registry/lifecycle.json');
const version=read('VERSION').trim();
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const plan=read('GLAZE_UI_V1_7_PLANNED.md');
const research=read('research/v1.7-visual-motion-direction.md');
const rootResearch=read('OPEN-SOURCE-RESEARCH.md');

assert(contract.version==='1.7.0-dev.36','contract version mismatch');
assert(contract.planVersion==='v1.2'&&contract.v12SpecificationSections.length===1&&contract.v12SpecificationSections[0]===43,'contract plan binding mismatch');
assert(contract.consumerEligible===false&&contract.stableBaseline==='1.6.0','contract lifecycle boundary weakened');
assert(contract.advancementObjectives.length===8,'contract advancement objective count mismatch');
assert(contract.governingDirection.comprehensionBeforeSpectacle===true,'comprehension-before-spectacle policy missing');
assert(contract.materialPolicy.glassEverywhereAllowed===false,'glass-everywhere boundary weakened');
assert(contract.motionPolicy.animationEverywhereAllowed===false,'animation-everywhere boundary weakened');
assert(contract.motionPolicy.authoritativeOccurrenceRequired===true,'authoritative motion occurrence boundary weakened');
assert(contract.acceptanceBoundary.section43Complete===false,'contract overclaims Section 43 completion');
assert(schema.properties.version.const==='1.7.0-dev.36','schema version mismatch');
assert(schema.properties.v12SpecificationSections.const[0]===43,'schema plan binding mismatch');

const base={
  advancementAreas:['adaptive-composition','connected-transitions','spatial-continuity'],
  surfaceRole:'content',
  materialPurpose:'readability',
  motionPurpose:'adaptive-composition',
  prominence:'prominent',
  transitionOccurrenceAuthoritative:true,
  expressionProfile:'expressive',
  expressionProfileAuthoritative:true,
  performancePressure:'neutral',
  performancePressureAuthoritative:true,
  accessibility:{reducedMotion:false,reducedTransparency:false,increasedContrast:false,forcedColors:false},
  accessibilityAuthoritative:true
};

const expressive=resolveGlazeVisualMotionDirectionV12(base);
assert(expressive.direction.materialDirective==='solid-or-opaque-surface','readability should not imply glass');
assert(expressive.direction.motionDirective==='signature-emphasized','meaningful prominent expressive relationship should allow governed emphasis');
assert(expressive.direction.glassEverywhereAllowed===false&&expressive.direction.animationEverywhereAllowed===false,'direction overreach boundary weakened');

const untrusted=resolveGlazeVisualMotionDirectionV12({...base,transitionOccurrenceAuthoritative:false});
assert(untrusted.direction.motionDirective==='immediate-state','untrusted transition occurrence must fail closed');
assert(untrusted.authority.transitionOccurrenceOwnedByCallerOrProvider===true,'transition authority boundary weakened');

const reduced=resolveGlazeVisualMotionDirectionV12({...base,accessibility:{...base.accessibility,reducedMotion:true}});
assert(reduced.direction.motionDirective==='reduced-motion-equivalent','Reduced Motion must take precedence');

const untrustedAccessibility=resolveGlazeVisualMotionDirectionV12({
  ...base,
  accessibility:{...base.accessibility,reducedMotion:true,reducedTransparency:true},
  accessibilityAuthoritative:false
});
assert(untrustedAccessibility.accessibility.untrustedNonNeutralIgnored===true,'untrusted accessibility state must be identified');
assert(untrustedAccessibility.accessibility.effective.reducedMotion===false&&untrustedAccessibility.accessibility.effective.reducedTransparency===false,'untrusted accessibility state must fail closed to neutral');
assert(untrustedAccessibility.direction.motionDirective==='signature-emphasized','untrusted accessibility flags must not manufacture presentation constraints');

const opaque=resolveGlazeVisualMotionDirectionV12({...base,surfaceRole:'transient',materialPurpose:'transient-separation',accessibility:{...base.accessibility,reducedTransparency:true}});
assert(opaque.direction.materialDirective==='solid-certainty','Reduced Transparency must force a solid equivalent');

const decorative=resolveGlazeVisualMotionDirectionV12({...base,advancementAreas:['quiet-recognizable-motion'],surfaceRole:'decorative',materialPurpose:'ambient-accent',motionPurpose:'microinteraction'});
assert(decorative.direction.motionDirective==='none','decorative motion must be suppressed by default');
assert(decorative.direction.materialDirective==='restrained-accent-only','decorative material must remain restrained');

const severe=resolveGlazeVisualMotionDirectionV12({...base,performancePressure:'severe',performancePressureAuthoritative:true});
assert(severe.direction.motionDirective==='immediate-state','severe authoritative performance pressure must remove optional motion');

const ignoredPressure=resolveGlazeVisualMotionDirectionV12({...base,performancePressure:'severe',performancePressureAuthoritative:false});
assert(ignoredPressure.performance.effective==='neutral'&&ignoredPressure.performance.untrustedNonNeutralIgnored===true,'untrusted performance pressure must not manufacture platform truth');

for(const bad of [
  ()=>resolveGlazeVisualMotionDirectionV12({...base,backdropBlurPx:24}),
  ()=>resolveGlazeVisualMotionDirectionV12({...base,durationMs:240}),
  ()=>resolveGlazeVisualMotionDirectionV12({...base,easing:'custom'}),
  ()=>resolveGlazeVisualMotionDirectionV12({...base,score:10}),
  ()=>resolveGlazeVisualMotionDirectionV12({...base,winner:'expressive'}),
  ()=>resolveGlazeVisualMotionDirectionV12({...base,advancementAreas:[]})
]){
  let failed=false;
  try{bad();}catch{failed=true;}
  assert(failed,'raw/ungoverned visual-motion input must fail closed');
}

assert(tokens.version==='1.7.0-dev.36'&&tokens.v12SpecificationSections[0]===43,'token identity mismatch');
assert(tokens.direction.comprehensionBeforeSpectacle===true,'token direction policy missing');
assert(tokens.direction.glassEverywhereAllowed===false&&tokens.direction.animationEverywhereAllowed===false,'token overreach boundary weakened');
assert(tokens.acceptance.section43Complete===false,'token acceptance boundary weakened');

assert(glazeV17VisualMotionDirectionDevelopmentContract.version==='1.7.0-dev.36','runtime contract identity mismatch');
assert(glazeV17VisualMotionDirectionDevelopmentContract.rawEffectControlsAccepted===false,'runtime raw controls boundary weakened');
assert(glazeV17VisualMotionDirectionDevelopmentContract.section43Complete===false,'runtime overclaims Section 43 completion');
assert(glazeV17CrossDeviceConsistencyDevelopmentContract.version==='1.7.0-dev.35','Section 42 dependency changed');
assert(VISUAL_MOTION_ADVANCEMENT_OBJECTIVES.length===8,'runtime advancement objective count mismatch');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=36,'aggregate version regressed below dev.36');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle boundary weakened');
assert(glazeV17Development.planV12FoundationSections.includes(43),'aggregate missing Section 43');
assert(glazeV17Development.visualMotionDirectionFoundation==='js/glaze-v1.7-visual-motion-direction.dev.mjs','aggregate missing dev.36 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Experimental Glaze Motion');

assert(version==='1.7.0','VERSION must identify bounded V1.7 Anchor');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','lifecycle authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','V1.7 must not become lifecycle candidate by source implementation');

assert(planned.includes('1.7.0-dev.36')&&planned.includes('Visual and Motion Direction'),'planned-feature control missing dev.36');
assert(implemented.includes('Visual and Motion Direction')&&implemented.includes('1.7.0-dev.36'),'implemented-feature control missing dev.36');
assert(changelog.includes('1.7.0-dev.36')&&changelog.includes('Visual and Motion Direction'),'changelog missing dev.36');
assert(plan.includes('dev.36')&&plan.includes('Section 43'),'planned upgrade authority boundary missing dev.36');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

for(const phrase of [
  'androidx/androidx','23327507f7fc7d5b19d65fec4b090f60c970079b','Apache-2.0',
  'microsoft/fluentui','8add8c8750c34c85acd811e32ab324abf8f1562e','MIT',
  'GNOME/libadwaita','0ffcd2c80b2260bdae01b89e88d94bb5c856db13','LGPL-2.1-or-later',
  'No third-party source code'
])assert(research.includes(phrase),'research provenance missing: '+phrase);
assert(rootResearch.includes('## V1.7 dev.36 — Visual and Motion Direction'),'root research register missing dev.36');

console.log('GLAZE UI V1.7 Visual and Motion Direction Development validation: PASS');
console.log('Plan binding: v1.2 Section 43');
console.log('Advancement objectives: 8');
console.log('Glass everywhere allowed: false');
console.log('Animation everywhere allowed: false');
console.log('Raw effect/ranking controls accepted: false');
console.log('Section 43 complete: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
