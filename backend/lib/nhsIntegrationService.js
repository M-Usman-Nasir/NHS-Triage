'use strict';

function isNhsIntegrationEnabled() {
  return process.env.NHS_INTEGRATION_ENABLED === 'true';
}

function getNhsIntegrationStatus() {
  return {
    enabled: isNhsIntegrationEnabled(),
    provider: process.env.NHS_INTEGRATION_PROVIDER || 'nhs_stub',
    environment: process.env.NHS_INTEGRATION_ENV || 'sandbox',
    hasClientId: Boolean(process.env.NHS_CLIENT_ID),
    hasRedirectUri: Boolean(process.env.NHS_REDIRECT_URI),
  };
}

function buildConnectUrl(state) {
  const baseUrl = process.env.NHS_AUTH_BASE_URL || 'https://auth.example.nhs.uk';
  const clientId = process.env.NHS_CLIENT_ID || 'unset-client-id';
  const redirectUri = encodeURIComponent(process.env.NHS_REDIRECT_URI || 'http://localhost:3000/nhs/callback');
  const scope = encodeURIComponent('openid profile nhs_number');
  return `${baseUrl}/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${redirectUri}&scope=${scope}&state=${encodeURIComponent(state)}`;
}

module.exports = {
  isNhsIntegrationEnabled,
  getNhsIntegrationStatus,
  buildConnectUrl,
};

