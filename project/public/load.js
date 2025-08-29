(function() {
  'use strict';

  // --- Configuration & Constants ---

  const SCRIPT_SELECTOR = 'script[src*="load.js"]';
  const CONSENT_COOKIE_NAME = 'dsgvo_consent';
  const BANNER_CONTAINER_ID = 'dsgvo-banner-container';

  // Fallback IDs for buttons if no selectors are provided in the project config
  const FALLBACK_SELECTORS = {
    acceptAll: '#uc-allow',
    acceptSelection: '#uc-save, #uc-save-settings', // Added #uc-save
    necessaryOnly: '#uc-deny, #uc-necessary',
  };

  // --- Utility Functions ---

  /**
   * Logs an error message to the console, prefixed with the banner name.
   * @param {...any} args - The message parts to log.
   */
  function logError(...args) {
    console.error('DSGVO Banner:', ...args);
  }

  /**
   * Logs a message to the console, prefixed with the banner name.
   * @param {...any} args - The message parts to log.
   */
  function logInfo(...args) {
    console.log('DSGVO Banner:', ...args);
  }

  /**
   * Replaces placeholders in the banner HTML with project-specific values.
   * @param {string} html - The HTML string with placeholders.
   * @param {object} project - The project configuration object.
   * @returns {string} The processed HTML string.
   */
  function replacePlaceholders(html, project) {
    if (!project) return html;
    return html
      .replace(/\[#TITLE#\]/g, project.banner_title || '')
      .replace(/\[#TEXT#\]/g, project.banner_text || '')
      .replace(/\[#ACCEPT_ALL_TEXT#\]/g, project.accept_all_text || 'Accept All')
      .replace(/\[#ACCEPT_SELECTION_TEXT#\]/g, project.accept_selection_text || 'Accept Selection')
      .replace(/\[#NECESSARY_ONLY_TEXT#\]/g, project.necessary_only_text || 'Necessary Only');
  }

  // --- Core Application Logic ---

  // Store config in a scope accessible by the event handlers
  let bannerConfig = null;
  let scriptOrigin = '';
  let projectId = '';

  /**
   * Sends the user's consent data to the server.
   * @param {object} consentData - The consent payload.
   */
  function sendConsent(consentData) {
    logInfo('Sending consent data...', consentData);
    fetch(`${scriptOrigin}/api/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consentData),
    })
    .then(response => {
      if (!response.ok) {
        // Try to get error message from response, otherwise use status text
        return response.json().then(err => { throw new Error(err.error || response.statusText) });
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        const banner = document.getElementById(BANNER_CONTAINER_ID);
        if (banner) banner.style.display = 'none';
        // Set a cookie to remember consent for 1 year
        const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${CONSENT_COOKIE_NAME}=true; expires=${expires}; path=/; SameSite=None; Secure`;
        logInfo('Consent saved successfully.');
      } else {
        // This path might not be reached if the server returns non-2xx status
        logError('Failed to save consent.', data.error || 'Unknown error');
      }
    })
    .catch(error => {
      logError('Error sending consent.', error.message);
    });
  }

  // --- Global Banner API ---

  const dsgvoBannerAPI = {
    acceptAllCookies: () => {
      if (!bannerConfig) return logError('Configuration not loaded.');
      const allServiceIds = bannerConfig.services.map(s => s.id);
      const allCategoryNames = bannerConfig.categories.map(c => c.name);
      sendConsent({
        project_id: projectId,
        accepted_services: allServiceIds,
        accepted_category_names: allCategoryNames,
        is_accept_all: true
      });
    },
    
    acceptSelection: () => {
      if (!bannerConfig) return logError('Configuration not loaded.');
      const banner = document.getElementById(BANNER_CONTAINER_ID);
      if (!banner) return logError('Banner container not found.');

      const selectedCategoryIds = new Set();
      
      // Find all checked category switches
      const switches = banner.querySelectorAll('input[data-category-id]:checked');
      switches.forEach(sw => {
        const catId = parseInt(sw.getAttribute('data-category-id'), 10);
        if (!isNaN(catId)) selectedCategoryIds.add(catId);
      });

      // Always include the 'necessary' category
      const necessaryCategory = bannerConfig.categories.find(c => c.required);
      if (necessaryCategory) selectedCategoryIds.add(necessaryCategory.id);

      const acceptedServiceIds = bannerConfig.services
        .filter(service => selectedCategoryIds.has(service.category_id))
        .map(service => service.id);
      
      const acceptedCategoryNames = bannerConfig.categories
        .filter(c => selectedCategoryIds.has(c.id))
        .map(c => c.name);

      sendConsent({
        project_id: projectId,
        accepted_services: acceptedServiceIds,
        accepted_category_names: acceptedCategoryNames,
        is_accept_all: false
      });
    },

    necessaryOnly: () => {
      if (!bannerConfig) return logError('Configuration not loaded.');
      const necessaryCategory = bannerConfig.categories.find(c => c.required);
      if (!necessaryCategory) {
        // If no category is marked as required, send empty selection
        sendConsent({ project_id: projectId, accepted_services: [], accepted_category_names: [], is_accept_all: false });
        return;
      }
      
      const necessaryServiceIds = bannerConfig.services
        .filter(s => s.category_id === necessaryCategory.id)
        .map(s => s.id);

      sendConsent({
        project_id: projectId,
        accepted_services: necessaryServiceIds,
        accepted_category_names: [necessaryCategory.name],
        is_accept_all: false
      });
    },

    open: () => {
      const banner = document.getElementById(BANNER_CONTAINER_ID);
      if (banner) banner.style.display = 'block';
    },
    close: () => {
      const banner = document.getElementById(BANNER_CONTAINER_ID);
      if (banner) banner.style.display = 'none';
    }
  };

  /**
   * Handles clicks on the banner buttons using event delegation.
   * @param {Event} event - The click event.
   */
  function handleBannerClick(event) {
    const target = event.target.closest('button');
    if (!target) return;

    const projectSelectors = bannerConfig.project || {};
    
    const actions = {
      [projectSelectors.accept_all_selector || FALLBACK_SELECTORS.acceptAll]: dsgvoBannerAPI.acceptAllCookies,
      [projectSelectors.accept_selection_selector || FALLBACK_SELECTORS.acceptSelection]: dsgvoBannerAPI.acceptSelection,
      [projectSelectors.necessary_only_selector || FALLBACK_SELECTORS.necessaryOnly]: dsgvoBannerAPI.necessaryOnly,
    };

    for (const selector in actions) {
      if (target.matches(selector)) {
        actions[selector]();
        return; // Stop after finding the first match
      }
    }
  }

  /**
   * Creates and injects the banner into the DOM.
   * @param {object} config - The configuration object from the API.
   */
  function loadBanner(config) {
    if (!config || !config.banner_html) {
      return logError('Invalid or empty configuration received.');
    }
    
    bannerConfig = config; // Store config for global access

    const bannerContainer = document.createElement('div');
    bannerContainer.id = BANNER_CONTAINER_ID;
    
    const processedHtml = replacePlaceholders(config.banner_html, config.project);

    bannerContainer.innerHTML = `
      <style>${config.banner_css || ''}</style>
      ${processedHtml}
    `;

    document.body.appendChild(bannerContainer);
    bannerContainer.addEventListener('click', handleBannerClick);
  }

  /**
   * Initializes the banner script.
   */
  function init() {
    // 1. Check for existing consent cookie
    if (document.cookie.includes(`${CONSENT_COOKIE_NAME}=true`)) {
      logInfo('Consent cookie found. Banner will not be displayed.');
      return;
    }

    // 2. Find the script tag and extract project ID and origin
    const scriptTag = document.querySelector(SCRIPT_SELECTOR);
    if (!scriptTag) {
      return logError('Could not find the script tag.');
    }

    try {
      const url = new URL(scriptTag.src);
      projectId = url.searchParams.get('id');
      scriptOrigin = url.origin;
    } catch (e) {
      return logError('Invalid script URL.', e.message);
    }
    
    if (!projectId) {
      return logError('Project ID is missing in the script tag URL.');
    }

    // 3. Expose the public API
    window.dsgvoBanner = dsgvoBannerAPI;
    // Also attach functions directly for legacy onclick attributes
    window.acceptAllCookies = dsgvoBannerAPI.acceptAllCookies;
    window.acceptSelection = dsgvoBannerAPI.acceptSelection;
    window.necessaryOnly = dsgvoBannerAPI.necessaryOnly;

    // 4. Fetch configuration and load the banner
    const apiUrl = `${scriptOrigin}/api/config?id=${projectId}`;
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
        return response.json();
      })
      .then(loadBanner)
      .catch(error => {
        logError('Failed to load configuration.', error.message);
      });
  }

  // --- Script Execution ---

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
