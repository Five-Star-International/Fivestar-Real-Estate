(function (window, document) {
  'use strict';

  // Preview and development traffic must not enter the production GA4 property.
  if (window.location.hostname !== 'fivestar.ie' || window.fiveStarRealEstateAnalytics) {
    return;
  }
  window.fiveStarRealEstateAnalytics = true;

  function consentGranted (name) {
    try {
      return window.localStorage.getItem('consent_' + name) === 'true';
    } catch (error) {
      return false;
    }
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  // Keep defaults ahead of the container, matching the main site's choices.
  window.gtag('consent', 'default', {
    analytics_storage: consentGranted('analytics') ? 'granted' : 'denied',
    ad_storage: consentGranted('advertising') ? 'granted' : 'denied',
    ad_user_data: consentGranted('advertising') ? 'granted' : 'denied',
    ad_personalization: consentGranted('advertising') ? 'granted' : 'denied',
    functionality_storage: consentGranted('necessary') ? 'granted' : 'denied',
    security_storage: consentGranted('necessary') ? 'granted' : 'denied'
  });

  // The existing GTM container owns the GA4 configuration and consent updates.
  // Do not add a second GA4 config/page_view or change the shared container here.
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-5LKD5NV6';
  document.head.appendChild(script);

  window.fiveStarTrackOwnerEnquiry = function (service, payload) {
    var leadTypes = { sell: 'property_sale', 'let': 'long_term_letting', value: 'property_valuation' };

    // A start/click/validation failure is not a submitted owner enquiry.
    // Explicit server errors must not be counted even if returned with HTTP 2xx.
    if (!leadTypes[service] || !consentGranted('analytics') ||
      (payload && (payload._unverifiedResponse || payload.success === false || payload.error || payload.errors || payload.validation_errors))) {
      return;
    }

    // No names, contact details, property addresses, invented values or revenue.
    window.gtag('event', 'generate_lead', {
      send_to: 'G-N69L7WZ0NF',
      lead_source: 'real_estate',
      lead_type: leadTypes[service],
      method: 'website_form'
    });
  };
})(window, document);
