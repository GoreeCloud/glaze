import {resolveGlazeTaskContinuity} from '../../js/glaze-v1.7-task-continuity.dev.mjs';
import {resolveGlazeAccessibilityContinuity} from '../../js/glaze-v1.7-accessibility-continuity.dev.mjs';
import {resolveGlazeFormFactorProfile} from '../../js/glaze-v1.7-form-factor-profiles.dev.mjs';
import {resolveGlazeSemanticColor} from '../../js/glaze-v1.7-theme-semantic-color.dev.mjs';
import {resolveGlazeSignatureMotion} from '../../js/glaze-v1.7-signature-motion-system.dev.mjs';
import {card,showCards,taskState,taskStateClasses} from './rendered-v1.2-qualification-shared.mjs';

export function renderAccessibilityScene(scene,stage,assertions){
  if(['reduced-transparency','increased-contrast','forced-colors','large-text'].includes(scene)){
    const r=resolveGlazeAccessibilityContinuity({
      accessibilityChanges:[scene],
      accessibilityStateAuthoritative:true,
      previousTaskState:taskState,
      stateClasses:taskStateClasses
    });
    const p=r.presentation;
    showCards(stage,'Accessibility presentation - '+scene,[
      card('Accepted mode',r.accessibility.acceptedModes.join(', ')),
      card('Task reset allowed',r.task.continuity.taskResetAllowed),
      card('Color-only meaning',p.colorOnlyMeaningAllowed)
    ]);
    Object.assign(assertions,{
      modeAccepted:r.accessibility.acceptedModes.includes(scene),
      taskPreserved:r.task.state.draftText===taskState.draftText,
      taskResetRejected:r.task.continuity.taskResetAllowed===false,
      colorOnlyMeaningRejected:p.colorOnlyMeaningAllowed===false
    });
    if(scene==='reduced-transparency')assertions.solidEquivalentRequired=p.reducedTransparency.solidOrOpaqueEquivalentRequired===true;
    if(scene==='increased-contrast')assertions.higherContrastRequired=p.increasedContrast.higherContrastVariantRequired===true;
    if(scene==='forced-colors')assertions.platformPalettePreserved=p.forcedColors.platformPaletteAuthorityPreserved===true;
    if(scene==='large-text')assertions.reflowRequired=p.largeText.reflowRequired===true&&p.largeText.twoHundredPercentTextSupportRequired===true;
    return {acceptedModes:r.accessibility.acceptedModes,presentation:p};
  }
  if(scene==='rtl'){
    document.documentElement.dir='rtl';
    const r=resolveGlazeTaskContinuity({environmentChange:'appearance',previous:taskState,incoming:{},stateClasses:taskStateClasses});
    showCards(stage,'Right-to-left continuity',[
      card('Destination',r.state.navigationDestination),
      card('Focus',r.state.focusId),
      card('Draft',r.state.draftText)
    ]);
    Object.assign(assertions,{
      rtlDirectionApplied:getComputedStyle(stage).direction==='rtl',
      navigationPreserved:r.state.navigationDestination===taskState.navigationDestination,
      focusPreserved:r.state.focusId===taskState.focusId,
      taskResetRejected:r.continuity.taskStateResetOnRecompositionAllowed===false
    });
    return r.state;
  }
  if(scene==='representative-rendering'){
    const profile=resolveGlazeFormFactorProfile({profile:'desktop',semanticSurfaceId:'representative-task'});
    const semantic=resolveGlazeSemanticColor({role:'privacy',prominence:'prominent',authoritative:true});
    const motion=resolveGlazeSignatureMotion({relationship:'workspace-recomposition',relationshipAuthoritative:true,userDriven:true});
    const continuity=resolveGlazeTaskContinuity({environmentChange:'multi-pane-recomposition',previous:taskState,incoming:{},stateClasses:taskStateClasses});
    showCards(stage,'Representative rendering',[
      card('Desktop navigation',profile.expectations.navigation),
      card('Task state',continuity.state.draftText),
      card('Semantic token',semantic.token)
    ],'multi-pane');
    Object.assign(assertions,{
      desktopProfile:profile.profile==='desktop',
      taskPreserved:continuity.state.draftText===taskState.draftText,
      semanticToken:semantic.token==='semantic.privacy.prominent',
      motionSemantic:motion.signature.family==='Glaze Flow',
      nativeAcceptanceNotImplied:profile.supportBoundary.nativeDeviceAcceptanceImplied===false
    });
    return {profile:profile.expectations,semantic:semantic.token,motion:motion.signature.family};
  }
  return null;
}
