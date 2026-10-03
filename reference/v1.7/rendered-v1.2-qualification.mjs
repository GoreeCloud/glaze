import {glazeV17V13Development} from '../../js/glaze-v1.7-development-v1-3.dev.mjs';
import {renderCoreScene} from './rendered-v1.2-scenes-core.mjs';
import {renderSignatureScene} from './rendered-v1.2-scenes-signature.mjs';
import {renderMotionPolicyScene} from './rendered-v1.2-scenes-motion-policy.mjs';
import {renderFormFactorScene} from './rendered-v1.2-scenes-form-factor.mjs';
import {renderAccessibilityScene} from './rendered-v1.2-scenes-accessibility.mjs';

const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const scene=params.get('scene')||'representative-rendering';
const revision=params.get('revision')||'';
const mode=params.get('mode')||scene;
const profile=params.get('profile')||'';
const posture=params.get('posture')||'unknown';
const exactRevision=/^[0-9a-f]{40}$/.test(revision);
const stage=$('stage');

document.body.dataset.mode=mode;
document.body.dataset.scene=scene;
document.documentElement.dataset.mode=mode;
$('scene-pill').textContent='Scene: '+scene;
$('revision-pill').textContent='Revision: '+(exactRevision?revision:'UNBOUND');
$('source-pill').textContent='Source: '+glazeV17V13Development.version;

const assertions={
  exactRevisionParameter:exactRevision,
  aggregateVersion:glazeV17V13Development.version==='1.7.0-dev.47',
  stableBaselinePreserved:glazeV17V13Development.stableBaseline==='1.6.0',
  consumerEligibilityNotGranted:glazeV17V13Development.consumerEligible===false
};

let sceneData=
  renderCoreScene(scene,stage,assertions)
  ??renderSignatureScene(scene,stage,assertions)
  ??renderMotionPolicyScene(scene,stage,assertions)
  ??renderFormFactorScene(scene,profile,posture,stage,assertions)
  ??renderAccessibilityScene(scene,stage,assertions);

if(sceneData===null)throw new Error('Unsupported retained v1.2 rendered scene: '+scene);

if(scene==='reduced-motion'){
  const sample=document.createElement('div');
  sample.className='skeleton-line';
  stage.appendChild(sample);
}

await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

const rootFont=parseFloat(getComputedStyle(document.documentElement).fontSize);
const visual=scene==='reduced-transparency'?stage:(stage.querySelector('.panel,.pane')||stage);
const visualStyle=getComputedStyle(visual);
const overflow=Math.max(0,document.documentElement.scrollWidth-innerWidth);
assertions.noHorizontalOverflow=overflow<=1;

if(scene==='reduced-transparency'){
  assertions.renderedTransparencyDisabled=(visualStyle.backdropFilter||visualStyle.webkitBackdropFilter||'none')==='none';
}
if(scene==='increased-contrast'){
  assertions.renderedStrongBoundary=parseFloat(visualStyle.borderTopWidth)>=1;
}
if(scene==='forced-colors'){
  assertions.renderedForcedColorsActive=matchMedia('(forced-colors: active)').matches===true;
}
if(scene==='large-text'){
  assertions.renderedLargeText=rootFont>=30;
}
if(scene==='reduced-motion'){
  const sampleStyle=getComputedStyle(document.querySelector('.skeleton-line'));
  assertions.renderedMotionDisabled=sampleStyle.animationName==='none'||parseFloat(sampleStyle.animationDuration)===0;
}

const evidence={
  schemaVersion:1,
  kind:'glaze-v1.7-v1.2-rendered-browser-scene',
  scene,
  sourceRevisionParameter:exactRevision?revision:null,
  sourceModelVersion:glazeV17V13Development.version,
  acceptanceModelVersion:'1.7.0-dev.39',
  stableBaseline:glazeV17V13Development.stableBaseline,
  viewport:{width:innerWidth,height:innerHeight,devicePixelRatio},
  mode,
  profile:profile||null,
  sceneData,
  computed:{
    rootFontPx:rootFont,
    direction:getComputedStyle(stage).direction,
    horizontalOverflowPx:overflow
  },
  assertions,
  passed:Object.values(assertions).every(Boolean),
  authority:{
    renderedBrowserOnly:true,
    regressionBaselineClaimed:false,
    humanEvidenceClaimed:false,
    assistiveTechnologyEvidenceClaimed:false,
    physicalDeviceEvidenceClaimed:false,
    nativePlatformEvidenceClaimed:false,
    representativePerformanceEvidenceClaimed:false,
    energyEvidenceClaimed:false,
    v12QualificationClaimed:false,
    section46CompleteClaimed:false,
    v17AcceptanceClaimed:false,
    anchorStatusGranted:false,
    consumerEligibilityGranted:false,
    deploymentAcceptanceGranted:false,
    productionAcceptanceGranted:false,
    lifecyclePromotionAutomatic:false
  }
};

$('evidence-output').textContent=JSON.stringify(evidence,null,2);
window.__glazeV17V12RenderedEvidence=evidence;
window.__glazeV17V12RenderedReady=true;
