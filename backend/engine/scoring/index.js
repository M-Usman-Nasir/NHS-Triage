'use strict';

const { runFeverPainScoring } = require('./modules/feverPain');
const { runLesionClusterCountScoring } = require('./modules/lesionClusterCount');

const SCORING_MODULES = {
  feverpain: runFeverPainScoring,
  lesionclustercount: runLesionClusterCountScoring,
};

function normalizeModuleName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function applyPathwayScoring({ pathway, context, patient }) {
  const scoring = pathway && pathway.scoring ? pathway.scoring : null;
  const modules = scoring && Array.isArray(scoring.modules) ? scoring.modules : [];
  const scoreContext = { ...context };
  const scoreBreakdown = [];
  const governanceUncertainty = [];

  for (const moduleConfig of modules) {
    const outputKey = moduleConfig.outputKey || moduleConfig.id || null;
    if (outputKey && !Object.prototype.hasOwnProperty.call(scoreContext, outputKey)) {
      scoreContext[outputKey] = null;
    }

    const normalizedName = normalizeModuleName(moduleConfig.module);
    const runner = SCORING_MODULES[normalizedName];
    if (!runner) {
      governanceUncertainty.push(`scoring_module_not_found:${moduleConfig.module || 'unknown'}`);
      scoreBreakdown.push({
        module: moduleConfig.module || 'unknown',
        outputKey,
        ok: false,
        error: 'Scoring module not found.',
      });
      continue;
    }

    const result = runner({
      config: moduleConfig,
      context: scoreContext,
      patient,
      pathway,
    });

    if (!result.ok) {
      governanceUncertainty.push(`scoring_eval_failed:${moduleConfig.module || outputKey || 'unknown'}`);
    }

    if (outputKey) {
      scoreContext[outputKey] = result.score;
    }

    scoreBreakdown.push({
      module: moduleConfig.module,
      outputKey,
      score: result.score,
      ok: result.ok,
      error: result.error || null,
      factors: result.breakdown || [],
    });
  }

  return {
    context: scoreContext,
    scoreBreakdown,
    governanceUncertainty,
  };
}

module.exports = {
  applyPathwayScoring,
};

