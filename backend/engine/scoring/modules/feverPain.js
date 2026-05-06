'use strict';

const { runAdditiveFactorScoring } = require('./additiveFactors');

function runFeverPainScoring({ config, context, patient, pathway }) {
  return runAdditiveFactorScoring({
    config,
    context,
    patient,
    pathway,
    defaultErrorMessage: 'One or more FeverPAIN factors failed to evaluate.',
    idFallback: 'unknown_factor',
  });
}

module.exports = {
  runFeverPainScoring,
};

