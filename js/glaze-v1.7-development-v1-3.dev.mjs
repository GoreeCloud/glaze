export * from './glaze-v1.7-development.mjs';
export * from './glaze-v1.7-expression-system.dev.mjs';

import {glazeV17Development as v12Aggregate} from './glaze-v1.7-development.mjs';
import {glazeV17ExpressionSystemDevelopmentContract} from './glaze-v1.7-expression-system.dev.mjs';

export const glazeV17V13Development=Object.freeze({
  version:'1.7.0-dev.40',
  lifecycle:'development',
  stableBaseline:'1.6.0',
  consumerEligible:false,
  planVersion:'v1.3',
  priorAggregateVersion:v12Aggregate.version,
  priorAggregatePlanVersion:v12Aggregate.planVersion,
  planV12FoundationSections:v12Aggregate.planV12FoundationSections,
  planV13FoundationSections:Object.freeze([48]),
  expressionSystemFoundation:'js/glaze-v1.7-expression-system.dev.mjs',
  expressionSystemVersion:glazeV17ExpressionSystemDevelopmentContract.version,
  expressionSystemRequirementGroup:'expression-system-core',
  adaptiveExperienceSurfacesImplemented:false,
  section48Complete:false,
  acceptanceControlVersion:'1.7.0-dev.39',
  acceptanceControlAutomaticallyCoversV13:false,
  presentationOnly:true,
  accessibilityPrecedence:true,
  consumerAdoptionAutomatic:false,
  releasePromotionAutomatic:false
});
