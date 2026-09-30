/* GLAZE UI V1.7 — v1.3 Development aggregate.
 *
 * This aggregate extends the frozen v1.2 / dev.39 compatibility aggregate
 * without rewriting historical provenance or acceptance evidence.
 */
export * from './glaze-v1.7-development.mjs';
export * from './glaze-v1.7-expression-system.dev.mjs';
export * from './glaze-v1.7-provider-adaptive-surfaces.dev.mjs';

import {glazeV17Development as v12Aggregate} from './glaze-v1.7-development.mjs';
import {glazeV17ExpressionSystemDevelopmentContract} from './glaze-v1.7-expression-system.dev.mjs';
import {glazeV17ProviderAdaptiveSurfacesDevelopmentContract} from './glaze-v1.7-provider-adaptive-surfaces.dev.mjs';

export const glazeV17V13Development=Object.freeze({
  version:'1.7.0-dev.41',
  lifecycle:'Development',
  stableBaseline:'1.6.0',
  consumerEligible:false,
  planVersion:'v1.3',
  priorAggregateVersion:v12Aggregate.version,
  priorAggregatePlanVersion:v12Aggregate.planVersion,
  v13SpecificationSections:Object.freeze([48]),
  expressionSystemCoreVersion:glazeV17ExpressionSystemDevelopmentContract.version,
  providerAdaptiveSurfacesVersion:glazeV17ProviderAdaptiveSurfacesDevelopmentContract.version,
  implementedRequirementGroups:Object.freeze([
    'expression-system-core',
    'provider-adaptive-surfaces'
  ]),
  implementedAdaptiveSurfaces:Object.freeze([
    'glaze-contextual-actions',
    'glaze-brief',
    'glaze-control-center'
  ]),
  remainingAdaptiveSurfaces:Object.freeze([
    'glaze-workspace',
    'glaze-compact-surface',
    'glaze-agent-activity',
    'glaze-privacy-attention',
    'glaze-accessibility-presentation',
    'glaze-creative-surface',
    'glaze-compare',
    'glaze-care-surface'
  ]),
  section48Complete:false,
  acceptanceControlVersion:'1.7.0-dev.39',
  acceptanceControlAutomaticallyCoversV13:false,
  presentationOnly:true,
  providerTruthCreatedByGlaze:false,
  personalizationMayChangeExpression:true,
  personalizationMayChangeTruth:false,
  consumerAdoptionAutomatic:false,
  releasePromotionAutomatic:false,
  deploymentAcceptanceAutomatic:false,
  productionAcceptanceAutomatic:false
});
