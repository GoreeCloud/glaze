import {resolveGlazeTaskContinuity,resolveGlazeAdaptiveComposition} from '../../js/glaze-v1.7-task-continuity.dev.mjs';
import {resolveGlazeSemanticColor,evaluateGlazeThemeAccessibility,resolveGlazeThemeSafety,generateGlazeThemePalette} from '../../js/glaze-v1.7-theme-semantic-color.dev.mjs';
import {card,showCards,taskState,taskStateClasses} from './rendered-v1.2-qualification-shared.mjs';

export function renderCoreScene(scene,stage,assertions){
  if(scene==='task-continuity'){
    const r=resolveGlazeTaskContinuity({environmentChange:'window-resize',previous:taskState,incoming:{},stateClasses:taskStateClasses});
    showCards(stage,'Task continuity',[card('Navigation',r.state.navigationDestination),card('Focus',r.state.focusId),card('Draft',r.state.draftText)]);
    Object.assign(assertions,{
      navigationPreserved:r.state.navigationDestination===taskState.navigationDestination,
      focusPreserved:r.state.focusId===taskState.focusId,
      draftPreserved:r.state.draftText===taskState.draftText,
      taskResetRejected:r.continuity.taskStateResetOnRecompositionAllowed===false
    });
    return r;
  }
  if(scene==='adaptive-composition'){
    const r=resolveGlazeAdaptiveComposition({profile:'desktop',semanticSurfaceId:'memo-detail',surfaceRole:'detail',posture:'unknown',accessibilityProfiles:[]});
    showCards(stage,'Adaptive composition',[card('Profile',r.profile),card('Presentation',r.presentation),card('Semantic identity',r.preservation.semanticIdentityPreserved)],'dual-pane');
    Object.assign(assertions,{
      semanticIdentityPreserved:r.preservation.semanticIdentityPreserved===true,
      focusPreserved:r.preservation.focusPreserved===true,
      accessibilitySemanticsPreserved:r.preservation.accessibilitySemanticsPreserved===true,
      widthAloneNotAuthority:r.compositionRules.widthAloneIsAuthority===false
    });
    return r;
  }
  if(scene==='semantic-color'){
    const privacy=resolveGlazeSemanticColor({role:'privacy',prominence:'critical',authoritative:true});
    const success=resolveGlazeSemanticColor({role:'success',prominence:'prominent',authoritative:true});
    const withheld=resolveGlazeSemanticColor({role:'security',prominence:'critical',authoritative:false});
    showCards(stage,'Semantic color',[card('Privacy',privacy.token),card('Success',success.token),card('Untrusted security',withheld.acceptedRole)]);
    Object.assign(assertions,{
      privacyAccepted:privacy.acceptedRole==='privacy'&&privacy.protected===true,
      successAccepted:success.acceptedRole==='success',
      untrustedTruthWithheld:withheld.acceptedRole==='unknown'&&withheld.semanticTruthWithheldWithoutAuthority===true,
      colorOnlyMeaningRejected:privacy.colorOnlyMeaningAllowed===false
    });
    return {privacy,success,withheld};
  }
  if(scene==='theme-safety'){
    const diagnostics=evaluateGlazeThemeAccessibility({foreground:'#777777',background:'#777777',focus:'#777777',focusBackground:'#777777'});
    const r=resolveGlazeThemeSafety({requestedThemeId:'custom-low-contrast',diagnostics});
    showCards(stage,'Theme safety',[card('Requested',r.requestedThemeId),card('Accepted',r.acceptedThemeId),card('Fallback applied',r.fallbackApplied)]);
    Object.assign(assertions,{
      unsafeDiagnosticsRejected:diagnostics.conformant===false,
      safeFallbackApplied:r.fallbackApplied===true&&r.acceptedThemeId==='glaze-default',
      essentialControlsReachable:r.essentialControlsMustRemainReachable===true,
      protectedMeaningPreserved:r.protectedSemanticMeaningPreserved===true
    });
    return {diagnostics,r};
  }
  if(scene==='custom-theme-accessibility'){
    const palette=generateGlazeThemePalette({seed:'#4f7bca',mode:'dark'});
    const diagnostics=evaluateGlazeThemeAccessibility({foreground:palette.foreground,background:palette.primary,focus:palette.focus,focusBackground:palette.canvas});
    showCards(stage,'Custom-theme accessibility',[card('Primary',palette.primary),card('Text contrast',diagnostics.textContrast.toFixed(2)+':1'),card('Focus contrast',diagnostics.focusContrast.toFixed(2)+':1')]);
    Object.assign(assertions,{
      localPalette:palette.generatedLocally===true&&palette.networkRequired===false,
      textContrastPass:diagnostics.normalTextPass===true,
      focusContrastPass:diagnostics.focusPass===true,
      colorOnlyMeaningRejected:diagnostics.colorOnlyMeaningAllowed===false
    });
    return {palette,diagnostics};
  }
  return null;
}
