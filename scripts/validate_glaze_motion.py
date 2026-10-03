#!/usr/bin/env python3
"""Fail-closed governance validation for Glaze Motion 0.6 Experimental under the current Glaze UI Anchor."""
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
TOKENS=ROOT/'tokens/glaze-motion.json'
DOC=ROOT/'GLAZE_MOTION.md'
NATIVE=ROOT/'NATIVE_MOTION_MAPPINGS.md'
CSS=ROOT/'css/glaze.motion.core.css'
RUNTIME=ROOT/'js/glaze.motion.js'
ACCESSIBILITY=ROOT/'js/glaze.motion.accessibility.js'
CORE=ROOT/'js/glaze.motion.core.js'
REGISTRY=ROOT/'consumers'/'registry.json'
LIFECYCLE=ROOT/'registry'/'lifecycle.json'
REFERENCE=ROOT/'reference/glaze-motion.html'
RENDERED=ROOT/'scripts/validate_glaze_motion_rendered.py'

HISTORICAL_LAUNCHER='GoreeCloud/goreecloud-launcher'
CURRENT_LAUNCHER='GoreeCloud/launcher'
KEYBOARD='GoreeCloud/goreecloud-keyboard'
LAUNCHER_HEAD='3095b9320b660f5e166465990d5d2bee061d7422'
LAUNCHER_MERGE='23a389b3b24db726ceab5e328f9f8157fa7655ae'
KEYBOARD_HEAD='80de7bd2dcff6d07b06b19f8250e37d20155d7ff'
KEYBOARD_MERGE='c9c0500263b40640339cf7a46f1a029d9a2ac240'

def req(condition,message):
    if not condition:
        raise SystemExit(f'Glaze Motion validation failed: {message}')

def phrases(body,items,label):
    for item in items:
        req(item in body,f'{label} missing: {item}')

def by_repo(entries,repo):
    found=[x for x in entries if x.get('repository')==repo]
    req(len(found)==1,f'exactly one record required for {repo}')
    return found[0]

def main():
    required=(
        TOKENS,DOC,NATIVE,CSS,RUNTIME,ACCESSIBILITY,CORE,REGISTRY,LIFECYCLE,REFERENCE,RENDERED,
        ROOT/'tests/glaze-motion-runtime.test.mjs',
        ROOT/'tests/glaze-motion-interaction.test.mjs',
        ROOT/'tests/glaze-motion-accessibility.test.mjs',
        ROOT/'tests/glaze-motion-consumer.test.mjs'
    )
    for path in required:
        req(path.is_file(),f'missing {path.relative_to(ROOT)}')

    data=json.loads(TOKENS.read_text())
    meta=data.get('glazeMotion',{})
    req(meta.get('version')=='0.6.0' and meta.get('status')=='experimental','Glaze Motion 0.6 must remain Experimental')
    req(meta.get('extendsGlazeUi')=='1.5.0','historical Motion evaluation baseline changed')
    req(meta.get('runtimeCompatibilityBaseline')=='0.4.0','runtime compatibility baseline changed')

    tiers=data.get('tiers',{})
    req(tiers.get('core',{}).get('status')=='experimental','Motion Core must remain Experimental')
    req(tiers.get('studio',{}).get('status')=='planned','Motion Studio must remain Planned')
    req(tiers.get('spatial',{}).get('status')=='planned','Motion Spatial must remain Planned')

    req(data.get('durationsMs')=={'instant':0,'micro':90,'short':160,'medium':240,'long':360,'ambient':700},'duration roles changed')
    for name,spring in data.get('springs',{}).items():
        req(spring.get('mass',0)>0 and spring.get('stiffness',0)>0 and spring.get('damping',0)>0,f'{name} spring invalid')
        req(0<=spring.get('maxOvershoot',1)<=0.1,f'{name} overshoot unbounded')

    gestures=data.get('gestures',{})
    req(gestures.get('slopPx')==4 and gestures.get('velocityWindowMs')==120 and gestures.get('swipeThresholdRatio')==0.33,'gesture thresholds changed')
    req(gestures.get('directManipulationSurvivesReducedMotion') is True and gestures.get('settlingMotionCollapsesUnderReducedMotion') is True,'reduced-motion gesture invariants changed')
    req(gestures.get('keyboardAndRemoteAlternativesRequired') is True and gestures.get('semanticResultIndependentOfInputModality') is True,'input parity changed')

    accessible=data.get('accessibleInteraction',{})
    req(accessible.get('reorderRequiresStableKeys') is True,'stable-key reorder contract missing')
    req(accessible.get('hardCodedAnnouncementCopyProhibited') is True and accessible.get('localizationOwnedByConsumer') is True,'accessible localization boundary changed')

    perf=data.get('performance',{})
    req(perf.get('targetFps')==60 and perf.get('frameBudgetMs',99)<=16.7 and perf.get('maxLongTaskMs',99)<=50,'historical Motion performance budget weakened')
    req(perf.get('suspendOffscreenWork') is True and perf.get('avoidIdleRenderLoops') is True,'resource governance changed')
    req(perf.get('persistentWillChangeForCoreUi') is False,'persistent will-change prohibited')
    req(perf.get('instrumentation',{}).get('localOnly') is True and perf.get('instrumentation',{}).get('networkReporting') is False,'performance evidence must remain local-only')

    native=data.get('nativeMappings',{})
    req(native.get('requiredForCandidatePromotion') is True and native.get('semanticParityRequired') is True,'native mapping promotion boundary changed')

    evidence=data.get('consumerEvidence',{})
    req(evidence.get('productionConsumerCertification') is False,'reference evidence cannot certify production consumers')
    evaluations=evidence.get('firstPartyEvaluations')
    req(isinstance(evaluations,list) and len(evaluations)==2,'exactly two governed historical first-party evaluations required')

    historical_launcher=by_repo(evaluations,HISTORICAL_LAUNCHER)
    req(historical_launcher.get('pullRequest')==22 and historical_launcher.get('validatedHead')==LAUNCHER_HEAD and historical_launcher.get('mergeRevision')==LAUNCHER_MERGE,'Launcher historical Motion evidence changed')
    req(historical_launcher.get('evaluationMode')=='native-android-test-only' and historical_launcher.get('productionDependency') is False and historical_launcher.get('nativeDeviceCertification') is False and historical_launcher.get('candidatePromotionSufficient') is False,'Launcher Experimental boundary changed')

    historical_keyboard=by_repo(evaluations,KEYBOARD)
    req(historical_keyboard.get('pullRequest')==4 and historical_keyboard.get('validatedHead')==KEYBOARD_HEAD and historical_keyboard.get('mergeRevision')==KEYBOARD_MERGE,'Keyboard historical Motion evidence changed')
    req(historical_keyboard.get('evaluationMode')=='native-android-test-only' and historical_keyboard.get('productionDependency') is False and historical_keyboard.get('nativeDeviceCertification') is False and historical_keyboard.get('candidatePromotionSufficient') is False,'Keyboard Experimental boundary changed')

    reduced=data.get('reducedMotion',{})
    req(reduced.get('required') is True and reduced.get('durationMs')==0 and reduced.get('preserveDirectManipulationTracking') is True and reduced.get('removePostGestureInertia') is True,'reduced-motion invariants changed')

    req(data.get('authority',{})=={
        'presentation':'Glaze UI / Glaze Motion',
        'privacyTruth':'Privacy Shield',
        'securityTruth':'Wardveil Security',
        'resilienceTruth':'Everkeep',
        'coordinationTruth':'GoreeCloud Mesh'
    },'authority mapping changed')

    version=(ROOT/'VERSION').read_text().strip()
    req(version=='1.7.0','current bounded Anchor VERSION must remain 1.7.0')
    lifecycle=json.loads(LIFECYCLE.read_text())
    req(lifecycle.get('currentOfficial')==version and lifecycle.get('currentStable')==version and lifecycle.get('currentLifecycle')=='anchor','Glaze Motion validation must preserve current Glaze Anchor authority')
    req(lifecycle.get('activeCandidate') is None and lifecycle.get('plannedNext') == '1.7.1','Glaze Motion validation must not create lifecycle promotion state')

    registry=json.loads(REGISTRY.read_text())
    req(registry.get('officialBaseline')==version and registry.get('requiredConsumerVersion')==version,'consumer registry does not match current Glaze Anchor')

    launcher=by_repo(registry.get('consumers',[]),CURRENT_LAUNCHER)
    keyboard=by_repo(registry.get('consumers',[]),KEYBOARD)
    for consumer,label in ((launcher,'Launcher'),(keyboard,'Keyboard')):
        req(consumer.get('status')=='adoption-required',f'{label} must remain adoption-required')
        req(consumer.get('requiredTargetVersion')==version,f'{label} required target must match current Glaze Anchor')
        req(consumer.get('targetVersion') is None and consumer.get('referenceRevision') is None and consumer.get('evidence') is None,f'{label} must not gain unverified current-target acceptance evidence')
        req(consumer.get('productionEligible') is False,f'{label} must remain production-ineligible in the central registry')

    doc=DOC.read_text()
    phrases(doc,(
        'Experimental foundation (0.6.0)',
        'Runtime implementation baseline',
        'Direct manipulation and accessible gestures',
        'settling budget',
        'Native mappings',
        'First-party downstream evidence',
        'GoreeCloud Launcher',
        'GoreeCloud Keyboard',
        'Rendered acceptance',
        'Motion Studio — Planned',
        'Motion Spatial — Planned',
        'two test-only native Android evaluations are still insufficient'
    ),'GLAZE_MOTION.md')
    req(LAUNCHER_HEAD in doc and LAUNCHER_MERGE in doc and KEYBOARD_HEAD in doc and KEYBOARD_MERGE in doc,'Motion documentation missing exact historical consumer evaluation evidence')
    req('acceptance/glaze-motion-0.6-experimental.md' not in doc,'current Motion documentation points to retired acceptance path')
    req('v1.7-glaze-motion-lifecycle-reconciliation-20260926.md' in doc,'current V1.7 lifecycle reconciliation reference missing')

    native_doc=NATIVE.read_text()
    phrases(native_doc,('native animation, gesture, focus, and navigation conventions','Native mapping must not be inferred from a web demo','each platform requires its own implementation and acceptance evidence','Reduced Motion and platform accessibility preferences override decorative motion','Direct manipulation should track input without avoidable latency'),'native mapping guidance')

    css=CSS.read_text()
    req('Glaze Motion 0.3 Experimental' in css and '@media (prefers-reduced-motion: reduce)' in css,'retained Motion CSS markers missing')
    req('will-change:' not in css,'persistent will-change prohibited')

    runtime=RUNTIME.read_text()
    phrases(runtime,('GLAZE_MOTION_VERSION = "0.3.0"','createReorderModel','resolveSwipeAction','resolveDirectionalMove','createPanZoomState','createFrameBudgetProbe','createDragSession','startSharedTransition'),'compatibility runtime')

    acc=ACCESSIBILITY.read_text()
    phrases(acc,('GLAZE_MOTION_ACCESSIBILITY_VERSION = "0.4.0"','resolveReorderCommand','createAccessibleReorderController','createSettlingBudget','reason: "reduced-motion"','reason: "budget-exhausted"'),'accessibility runtime')
    req('announcement:' not in acc,'runtime must not hard-code localized announcement copy')

    core=CORE.read_text()
    phrases(core,('export * from "./glaze.motion.js"','export * from "./glaze.motion.accessibility.js"'),'aggregate runtime')

    print('Glaze Motion 0.6 Experimental validated under GLAZE UI V1.6 Anchor: historical Motion evidence preserved; current consumers remain adoption-required; Motion remains non-production')

if __name__=='__main__':
    main()
