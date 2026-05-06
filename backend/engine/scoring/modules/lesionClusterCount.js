'use strict';

const { runAdditiveFactorScoring } = require('./additiveFactors');

function runLesionClusterCountScoring({ config, context, patient, pathway }) {
  return runAdditiveFactorScoring({
    config,
    context,
    patient,
    pathway,
    defaultErrorMessage: 'One or more lesion-count factors failed to evaluate.',
    idFallback: 'unknown_factor',
  });
}

module.exports = {
  runLesionClusterCountScoring,
};

