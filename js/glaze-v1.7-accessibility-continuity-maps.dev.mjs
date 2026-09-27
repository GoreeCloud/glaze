export const accessibilityPreferenceByChange=Object.freeze({
  'large-text':'largeText',
  'reduced-motion':'reducedMotion',
  'reduced-transparency':'reducedTransparency',
  'increased-contrast':'increasedContrast',
  'screen-reader':'screenReaderOptimized',
  'touch-assistance':'touchAssistance',
  'keyboard-navigation':'keyboardFirst'
});

export const inputModelByAccessibilityChange=Object.freeze({
  'screen-reader':'assistive-input',
  'switch-access':'switch-access',
  'voice-access':'voice-access',
  'keyboard-navigation':'keyboard'
});

export const focusModalityByAccessibilityChange=Object.freeze({
  'screen-reader':'assistive-input',
  'switch-access':'assistive-input',
  'voice-access':'voice-focus',
  'keyboard-navigation':'keyboard',
  'touch-assistance':'touch'
});
