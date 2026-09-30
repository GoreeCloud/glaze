import {readFileSync} from 'node:fs';
import {
  resolveGlazeExpressionV13,
  glazeV17ExpressionSystemDevelopmentContract,
  EXPRESSION_SYSTEM_CAPABILITIES,
  EMPHASIS_ROLES
} from '../js/glaze-v1.7-expression-system.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const json=path=>JSON.parse(read(path));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/expression-system.dev.json');
const lifecycle=json('registry/lifecycle.json');
const version=read('VERSION').trim();
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const plan=read('GLAZE_UI_V1_7_PLANNED.md');
const supplement=read('docs/v1.7/GLAZE_UI_V1_7_EXPRESSION_ADAPTIVE_INTELLIGENCE.md');
const research=read('docs/research/v1.7-expression-system-core.md');

assert(contract.version==='1.7.0-dev.40','contract version mismatch');
assert(contract.planVersion==='v1.3'&&contract.v13SpecificationSections[0]===48,'contract plan binding mismatch');
assert(contract.consumerEligible===false&&contract.stableBaseline==='1.6.0','contract lifecycle boundary weakened');
assert(contract.resolutionPolicy.rawDesignValuesAccepted===false,'raw design values boundary weakened');
assert(contract.resolutionPolicy.visualProminenceEstablishesSemanticSeverity===false,'visual prominence must not create severity');
assert(contract.personalization.mayChangeExpression===true&&contract.personalization.mayChangeTruth===false,'personalization truth invariant missing');
assert(contract.acceptanceBoundary.section48Complete===false,'contract overclaims Section 48');

const base={
  geometryRole:'connected',
  emphasisRole:'hero',
  typographyRole:'display',
  containmentRole:'task-region',
  componentRole:'content',
  formFactor:'desktop',
  inputContext:'keyboard',
  densityRole:'standard',
  colorIntent:'identity',
  compositionRole:'primary-secondary',
  motionPurpose:'connected-identity',
  transitionOccurrenceAuthoritative:true,
  expressionProfile:'expressive',
  expressionProfileAuthoritative:true,
  performancePressure:'neutral',
  performancePressureAuthoritative:true,
  accessibility:{largeText:false,reducedMotion:false,reducedTransparency:false,increasedContrast:false,forcedColors:false},
  accessibilityAuthoritative:true,
  semanticSeverity:'ordinary',
  semanticSeverityAuthoritative:false
};

const hero=resolveGlazeExpressionV13(base);
assert(hero.intent.emphasisRole==='hero','Hero emphasis missing');
assert(hero.severity.accepted==='ordinary','Hero emphasis manufactured severity');
assert(hero.authority.emphasisCreatesSemanticSeverity===false,'emphasis authority boundary weakened');
assert(hero.personalization.truthMayChange===false,'personalization changed truth');
assert(hero.continuity.taskContinuityPreserved===true,'task continuity weakened');

const critical=resolveGlazeExpressionV13({...base,semanticSeverity:'critical',semanticSeverityAuthoritative:true});
assert(critical.severity.accepted==='critical','authoritative critical severity not preserved');
assert(critical.expression.materialDirective==='solid-certainty','critical certainty should use solid material');

const untrustedSeverity=resolveGlazeExpressionV13({...base,semanticSeverity:'critical',semanticSeverityAuthoritative:false});
assert(untrustedSeverity.severity.accepted==='unknown','untrusted severity must fail closed');

const largeText=resolveGlazeExpressionV13({...base,densityRole:'compact',accessibility:{...base.accessibility,largeText:true}});
assert(largeText.expression.typographyDirective==='scalable-reflow-priority','Large Text reflow precedence missing');
assert(largeText.expression.densityDirective.includes('reflow-for-large-text'),'compact density must yield to Large Text');

const reducedTransparency=resolveGlazeExpressionV13({...base,accessibility:{...base.accessibility,reducedTransparency:true}});
assert(reducedTransparency.expression.containmentDirective==='solid-accessibility-compatible-boundary','Reduced Transparency containment fallback missing');

const severe=resolveGlazeExpressionV13({...base,performancePressure:'severe',performancePressureAuthoritative:true});
assert(severe.expression.richness==='minimal','severe performance pressure should reduce optional richness');
assert(severe.continuity.authoritativeStatePreserved===true,'performance pressure changed authoritative state');

const ignoredPressure=resolveGlazeExpressionV13({...base,performancePressure:'severe',performancePressureAuthoritative:false});
assert(ignoredPressure.performance.effectivePressure==='neutral'&&ignoredPressure.performance.untrustedNonNeutralIgnored===true,'untrusted performance pressure must not manufacture platform truth');

for(const bad of [
  ()=>resolveGlazeExpressionV13({...base,cornerRadiusPx:24}),
  ()=>resolveGlazeExpressionV13({...base,fontSizePx:32}),
  ()=>resolveGlazeExpressionV13({...base,colorHex:'#fff'}),
  ()=>resolveGlazeExpressionV13({...base,durationMs:240}),
  ()=>resolveGlazeExpressionV13({...base,score:10}),
  ()=>resolveGlazeExpressionV13({...base,accepted:true})
]){
  let failed=false;
  try{bad();}catch{failed=true;}
  assert(failed,'raw/ungoverned expression input must fail closed');
}

assert(glazeV17ExpressionSystemDevelopmentContract.version==='1.7.0-dev.40','runtime contract mismatch');
assert(EXPRESSION_SYSTEM_CAPABILITIES.length===6&&EMPHASIS_ROLES.length===4,'runtime semantic catalog mismatch');

assert(glazeV17Development.version==='1.7.0-dev.40','aggregate version mismatch');
assert(glazeV17Development.planVersion==='v1.3','aggregate plan version mismatch');
assert(glazeV17Development.planV13FoundationSections.includes(48),'aggregate missing v1.3 Section 48');
assert(glazeV17Development.expressionSystemFoundation==='js/glaze-v1.7-expression-system.dev.mjs','aggregate missing expression foundation');
assert(glazeV17Development.consumerEligible===false,'aggregate became consumer eligible');

assert(version==='1.6.0','VERSION must remain V1.6 Anchor');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','lifecycle authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'source implementation must not create lifecycle candidate');

assert(planned.includes('1.7.0-dev.40')&&planned.includes('Expression System Core'),'planned-feature control missing dev.40');
assert(planned.includes('v1.3')&&planned.includes('48 sections'),'planning boundary remains stale');
assert(implemented.includes('Expression System Core')&&implemented.includes('1.7.0-dev.40'),'implemented-feature control missing dev.40');
assert(changelog.includes('1.7.0-dev.40')&&changelog.includes('Expression System Core'),'changelog missing dev.40');
assert(plan.includes('1.7.0-dev.40')&&plan.includes('Section 48'),'plan missing dev.40 source status');
assert(supplement.includes('1.7.0-dev.40')&&supplement.includes('adaptive experience surfaces remain planned'),'supplement missing bounded implementation boundary');
assert(research.includes('Third-party implementation is not incorporated')&&research.includes('W3C WCAG 2.2'),'research provenance missing');

console.log('GLAZE UI V1.7 Expression System Core Development validation: PASS');
console.log('Plan binding: v1.3 Section 48 / expression-system-core');
console.log('Expression capabilities: 6');
console.log('Raw design values accepted: false');
console.log('Visual prominence creates semantic severity: false');
console.log('Section 48 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
