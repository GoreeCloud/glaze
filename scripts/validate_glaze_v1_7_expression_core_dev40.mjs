import {readFileSync} from 'node:fs';
import {resolveGlazeExpressionV13,glazeV17ExpressionSystemDevelopmentContract} from '../js/glaze-v1.7-expression-system.dev.mjs';

const root=new URL('../',import.meta.url);
const json=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const assert=(v,m)=>{if(!v)throw new Error(m);};

const lifecycle=json('registry/lifecycle.json');
const version=readFileSync(new URL('VERSION',root),'utf8').trim();

assert(version==='1.7.0','bounded Stable machine version changed');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0','Stable lifecycle changed');
assert(glazeV17ExpressionSystemDevelopmentContract.version==='1.7.0-dev.40','dev.40 identity mismatch');
assert(glazeV17ExpressionSystemDevelopmentContract.planVersion==='v1.3','plan binding mismatch');
assert(glazeV17ExpressionSystemDevelopmentContract.section48Complete===false,'Section 48 overclaimed');

const base={
  geometryRole:'connected',emphasisRole:'hero',typographyRole:'display',
  containmentRole:'task-region',componentRole:'content',formFactor:'desktop',
  inputContext:'keyboard',densityRole:'standard',colorIntent:'identity',
  compositionRole:'primary-secondary',motionPurpose:'connected-identity',
  transitionOccurrenceAuthoritative:true,expressionProfile:'expressive',
  expressionProfileAuthoritative:true,performancePressure:'neutral',
  performancePressureAuthoritative:true,
  accessibility:{largeText:false,reducedMotion:false,reducedTransparency:false,increasedContrast:false,forcedColors:false},
  accessibilityAuthoritative:true,semanticSeverity:'ordinary',
  semanticSeverityAuthoritative:false
};

const hero=resolveGlazeExpressionV13(base);
assert(hero.severity.accepted==='ordinary','Hero emphasis created severity');
assert(hero.personalization.truthMayChange===false,'personalization changed truth');
assert(hero.continuity.taskContinuityPreserved===true,'task continuity weakened');

const critical=resolveGlazeExpressionV13({...base,semanticSeverity:'critical',semanticSeverityAuthoritative:true});
assert(critical.severity.accepted==='critical','authoritative severity lost');
assert(critical.expression.materialDirective==='solid-certainty','critical presentation must remain certainty-first');

const unknown=resolveGlazeExpressionV13({...base,semanticSeverity:'critical',semanticSeverityAuthoritative:false});
assert(unknown.severity.accepted==='unknown','untrusted severity did not fail closed');

const large=resolveGlazeExpressionV13({...base,densityRole:'compact',accessibility:{...base.accessibility,largeText:true}});
assert(large.expression.typographyDirective==='scalable-reflow-priority','Large Text precedence missing');

const reduced=resolveGlazeExpressionV13({...base,accessibility:{...base.accessibility,reducedTransparency:true}});
assert(reduced.expression.containmentDirective==='solid-accessibility-compatible-boundary','Reduced Transparency fallback missing');

const severe=resolveGlazeExpressionV13({...base,performancePressure:'severe',performancePressureAuthoritative:true});
assert(severe.expression.richness==='minimal','performance degradation missing');
assert(severe.continuity.authoritativeStatePreserved===true,'performance changed state truth');

for(const key of ['cornerRadiusPx','fontSizePx','colorHex','durationMs','score','accepted']){
  let failed=false;
  try{resolveGlazeExpressionV13({...base,[key]:key==='colorHex'?'#fff':10});}catch{failed=true;}
  assert(failed,'raw control accepted: '+key);
}

console.log('GLAZE UI V1.7 dev.40 Expression System Core validation: PASS');
