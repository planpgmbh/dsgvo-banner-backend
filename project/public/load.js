(function() {
  'use strict';

  // --- Configuration & Constants ---

  const SCRIPT_SELECTOR = 'script[src*="load.js"]';
  const CONSENT_COOKIE_NAME = 'dsgvo_consent';
  const BANNER_CONTAINER_ID = 'dsgvo-banner-container';

  // Banner uses data-action attributes for button handling

  // --- Utility Functions ---

  /**
   * Logs an error message to the console in production for debugging critical issues.
   * @param {...any} args - The message parts to log.
   */
  function logError(...args) {
    console.error('DSGVO Banner:', ...args);
  }

  /**
   * Info logging disabled in production for performance.
   */
  function logInfo() {
    // Info logging disabled in production
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

  /**
   * Dynamically inserts category switches into the banner HTML
   * @param {HTMLElement} bannerContainer - The banner container element
   */
  function insertCategorySwitches(bannerContainer) {
    const switchesContainer = bannerContainer.querySelector('.uc-groups');
    if (!switchesContainer || !bannerConfig.categories) return;

    // Find non-required categories and generate switches for them
    bannerConfig.categories
      .filter(category => !category.required)
      .forEach(category => {
        const switchHtml = `
          <div class="uc-group">
            <span class="uc-label">${category.name.replace(' Cookies', '')}</span>
            <label class="uc-switch" title="${category.name}">
              <input id="switch-${category.name.toLowerCase().replace(/\s+/g, '-').replace('-cookies', '')}" 
                     data-category-id="${category.id}" 
                     type="checkbox" 
                     aria-label="${category.name}">
              <span class="uc-switch-track"><span class="uc-switch-thumb"></span></span>
            </label>
          </div>
        `;
        switchesContainer.insertAdjacentHTML('beforeend', switchHtml);
      });
  }

  /**
   * Restores previously saved consent settings to the banner switches
   * @param {HTMLElement} bannerContainer - The banner container element
   */
  function restoreConsentSettings(bannerContainer) {
    try {
      const savedDetails = localStorage.getItem(`${CONSENT_COOKIE_NAME}_details`);
      if (!savedDetails) return;

      const consentDetails = JSON.parse(savedDetails);
      const acceptedCategories = consentDetails.accepted_categories || [];

      // Find category switches and set their state based on saved consent
      bannerConfig.categories.forEach(category => {
        const categorySwitch = bannerContainer.querySelector(`input[data-category-id="${category.id}"]`);
        if (categorySwitch && !categorySwitch.disabled) {
          categorySwitch.checked = acceptedCategories.includes(category.name);
        }
      });

      // Consent settings restored
    } catch (error) {
      logError('Failed to restore consent settings:', error.message);
    }
  }

  /**
   * Loads cookie services based on consented categories
   * @param {Array} acceptedCategories - Array of accepted category names
   */
  function loadConsentedServices(acceptedCategories) {
    if (!bannerConfig || !bannerConfig.services) {
      return logError('No services configuration available');
    }

    // Loading consented services
    
    // Find accepted category IDs
    const acceptedCategoryIds = bannerConfig.categories
      .filter(cat => acceptedCategories.includes(cat.name))
      .map(cat => cat.id);

    // Filter services that belong to accepted categories
    const servicesToLoad = bannerConfig.services.filter(service => 
      acceptedCategoryIds.includes(service.category_id)
    );

    // Load each service
    servicesToLoad.forEach(service => {
      loadService(service);
    });

    // Services loaded successfully
  }

  /**
   * Loads a specific cookie service by injecting its script code
   * @param {Object} service - The service object with script_code
   */
  function loadService(service) {
    try {
      if (!service.script_code) {
        return; // Service has no script code
      }

      // Create container for service scripts
      let serviceContainer = document.getElementById('dsgvo-services-container');
      if (!serviceContainer) {
        serviceContainer = document.createElement('div');
        serviceContainer.id = 'dsgvo-services-container';
        serviceContainer.style.display = 'none';
        document.head.appendChild(serviceContainer);
      }

      // Create service wrapper
      const serviceWrapper = document.createElement('div');
      serviceWrapper.id = `dsgvo-service-${service.id}`;
      serviceWrapper.innerHTML = service.script_code;

      serviceContainer.appendChild(serviceWrapper);
      // Service loaded successfully

      // Execute any scripts in the service code
      const scripts = serviceWrapper.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.head.appendChild(newScript);
      });

    } catch (error) {
      logError(`Failed to load service ${service.name}:`, error.message);
    }
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
    // Sending consent data to server
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
        
        // Store detailed consent information
        const consentDetails = {
          timestamp: new Date().toISOString(),
          accepted_categories: consentData.accepted_category_names || [],
          is_accept_all: consentData.is_accept_all || false,
          expires_at: data.expires_at
        };
        
        // Save to localStorage for detailed settings
        localStorage.setItem(`${CONSENT_COOKIE_NAME}_details`, JSON.stringify(consentDetails));
        
        // Set simple cookie to remember that consent was given
        // Use expiry_months from project configuration (default to 12 months if not set)
        const expiryMonths = bannerConfig.project?.expiry_months || 12;
        const expires = new Date(Date.now() + expiryMonths * 30 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${CONSENT_COOKIE_NAME}=true; expires=${expires}; path=/; SameSite=None; Secure`;
        
        // Consent saved successfully
        
        // Load appropriate services based on consent
        loadConsentedServices(consentDetails.accepted_categories);
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
    
    rejectAllCookies: () => {
      if (!bannerConfig) return logError('Configuration not loaded.');
      dsgvoBannerAPI.necessaryOnly();
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
      // Check if banner already exists
      let banner = document.getElementById(BANNER_CONTAINER_ID);
      if (banner) {
        banner.style.display = 'block';
        return;
      }
      
      // If no banner exists, reload it (even if consent cookie exists)
      if (bannerConfig) {
        const bannerContainer = document.createElement('div');
        bannerContainer.id = BANNER_CONTAINER_ID;
        
        const processedHtml = replacePlaceholders(bannerConfig.banner_html, bannerConfig.project);
        
        bannerContainer.innerHTML = `
          <style>${bannerConfig.banner_css || ''}</style>
          ${processedHtml}
        `;
        
        document.body.appendChild(bannerContainer);
        bannerContainer.addEventListener('click', handleBannerClick);
        
        // Insert category switches dynamically
        insertCategorySwitches(bannerContainer);
        
        // Restore previous consent settings to switches
        restoreConsentSettings(bannerContainer);
        
        // Banner reopened
      } else {
        logError('Cannot reopen banner: configuration not loaded.');
      }
    },
    close: () => {
      const banner = document.getElementById(BANNER_CONTAINER_ID);
      if (banner) banner.style.display = 'none';
    },
    showDetails: () => {
      showDetailsModal();
    }
  };

  /**
   * Handles clicks on the banner buttons using event delegation.
   * @param {Event} event - The click event.
   */
  function handleBannerClick(event) {
    const target = event.target.closest('button, a');
    if (!target) return;
    
    // Handle details link
    if (target.id === 'cookie-details') {
      event.preventDefault();
      showDetailsModal();
      return;
    }

    // Handle banner buttons
    const action = target.getAttribute('data-action');
    switch (action) {
      case 'acceptAll':
        dsgvoBannerAPI.acceptAllCookies();
        return;
      case 'acceptSelection':
        dsgvoBannerAPI.acceptSelection();
        return;
      case 'necessaryOnly':
        dsgvoBannerAPI.necessaryOnly();
        return;
      case 'rejectAll':
        dsgvoBannerAPI.rejectAllCookies();
        return;
    }
  }

  /**
   * Shows a detailed modal with information about all cookie services.
   */
  function showDetailsModal() {
    if (!bannerConfig) return logError('Configuration not loaded.');
    
    // Remove existing modal if present
    const existingModal = document.getElementById('dsgvo-details-modal');
    if (existingModal) existingModal.remove();
    
    // Load existing consent settings
    let existingConsent = {};
    try {
      const savedDetails = localStorage.getItem(`${CONSENT_COOKIE_NAME}_details`);
      if (savedDetails) {
        const consentDetails = JSON.parse(savedDetails);
        consentDetails.accepted_categories?.forEach(categoryName => {
          const category = bannerConfig.categories.find(c => c.name === categoryName);
          if (category) existingConsent[category.id] = true;
        });
      }
    } catch (error) {
      logError('Failed to load existing consent:', error.message);
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'dsgvo-details-modal';
    
    // Critical inline styles for modal overlay (protection against external CSS)
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.7) !important;
      z-index: 10000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px !important;
      box-sizing: border-box !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'uc-modal-content';
    
    // Critical inline styles for modal content (protection against external CSS)
    modalContent.style.cssText = `
      background: #ffffff !important;
      border-radius: 12px !important;
      max-width: 900px !important;
      width: 100% !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
      position: relative !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    `;
    
    // Generate content HTML
    let contentHTML = `
      <div class="uc-modal-header">
        <h2 class="uc-modal-title">Cookie-Einstellungen</h2>
        <button id="close-details-modal" class="uc-modal-close">&times;</button>
      </div>
      
      <div class="uc-modal-body">
        <div class="uc-modal-intro">
          <p>${bannerConfig.project.about_cookies_text || 'Cookies sind kleine Textdateien, die von Websites verwendet werden, um die Benutzererfahrung zu verbessern.'}</p>
        </div>
    `;
    
    // Group services by category
    const categoriesList = bannerConfig.categories || [];
    const servicesList = bannerConfig.services || [];
    
    categoriesList.forEach((category, categoryIndex) => {
      const categoryServices = servicesList.filter(service => service.category_id === category.id);
      const isRequired = category.required;
      const isChecked = isRequired || existingConsent[category.id] || false;
      
      contentHTML += `
        <div class="uc-category-container">
          <div class="uc-category-header" onclick="toggleCategoryDetails(${categoryIndex})" data-category-index="${categoryIndex}">
            <div class="uc-category-top">
              <h3 class="uc-category-title">
                ${categoryServices.length > 0 ? `<span class="uc-toggle-arrow" id="arrow-${categoryIndex}">></span>` : ''}
                ${category.name}
              </h3>
              <label class="uc-category-toggle" onclick="event.stopPropagation()">
                <input 
                  type="checkbox" 
                  data-category-id="${category.id}"
                  ${isChecked ? 'checked' : ''}
                  ${isRequired ? 'disabled' : ''}
                >
                <span class="uc-switch-track" style="background: ${isChecked ? 'var(--uc-switch-on)' : 'var(--uc-switch-off)'}"></span>
                <span class="uc-switch-thumb" style="left: ${isChecked ? '24px' : '4px'}"></span>
              </label>
            </div>
            <p class="uc-category-description">${category.description || 'Keine Beschreibung verfügbar'}</p>
            ${isRequired ? '<p class="uc-service-info">Erforderlich (kann nicht deaktiviert werden)</p>' : ''}
            
            ${categoryServices.length > 0 ? `
              <div id="category-details-${categoryIndex}" class="uc-services-details" style="display: none;">
            ` : ''}
      `;
      
      if (categoryServices.length > 0) {
        categoryServices.forEach((service, serviceIndex) => {
          // Determine legal basis and third country info
          const legalBasis = category.required ? 'Technische Notwendigkeit (Art. 6 Abs. 1 lit. c DSGVO)' : 'Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)';
          const isThirdCountry = service.provider && (
            service.provider.toLowerCase().includes('google') ||
            service.provider.toLowerCase().includes('meta') ||
            service.provider.toLowerCase().includes('facebook') ||
            service.provider.toLowerCase().includes('inc') ||
            service.provider.toLowerCase().includes('llc')
          );
          
          contentHTML += `
            <div class="uc-service-item">
              <h4 class="uc-service-name">${service.name}</h4>
              <p class="uc-service-description">
                ${service.description || 'Keine Beschreibung verfügbar'}
              </p>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                ${service.provider ? `<div class="uc-service-info"><strong>Anbieter:</strong><br><span style="color: #777;">${service.provider}</span></div>` : ''}
                ${service.retention_period ? `<div class="uc-service-info"><strong>Speicherdauer:</strong><br><span style="color: #777;">${service.retention_period}</span></div>` : ''}
                ${service.purpose ? `<div class="uc-service-info"><strong>Zweck:</strong><br><span style="color: #777;">${service.purpose}</span></div>` : ''}
                ${service.cookie_names ? `<div class="uc-service-info"><strong>Cookie-Namen:</strong><br><span class="uc-service-cookies">${service.cookie_names}</span></div>` : ''}
              </div>
              
              ${service.privacy_policy_url ? `
                <div style="margin-top: 10px;">
                  <a href="${service.privacy_policy_url}" target="_blank" class="uc-service-link">
                    Datenschutzerklärung des Anbieters ansehen →
                  </a>
                </div>
              ` : ''}
            </div>
          `;
        });
        
        contentHTML += `
              </div>
        `;
      } else {
        contentHTML += `
          <p class="uc-service-info" style="font-style: italic; margin: 15px 0 0 0;">
            Wir nutzen diese Cookie-Typen nicht.
          </p>
        `;
      }
      
      contentHTML += `
          </div>
        </div>
      `;
    });
    
    // Close modal-body and add GDPR rights section and action buttons
    contentHTML += `
        
        <div class="uc-gdpr-rights">
          <h3 class="uc-gdpr-title">Ihre Rechte nach der DSGVO</h3>
          <div class="uc-gdpr-content">
            <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Bei Fragen wenden Sie sich an den Datenschutzbeauftragten oder die verantwortliche Stelle.</p>
          </div>
        </div>
      </div>
      
      <div class="uc-modal-buttons">
        <button id="revoke-consent-details" class="uc-modal-button withdraw">Einwilligung widerrufen</button>
        <button id="reject-all-details" class="uc-modal-button reject">Alle ablehnen</button>
        <button id="accept-selection-details" class="uc-modal-button selection">Auswahl bestätigen</button>
        <button id="accept-all-details" class="uc-modal-button accept">Alle bestätigen</button>
      </div>
    `;
    
    modalContent.innerHTML = contentHTML;
    modal.appendChild(modalContent);
    
    // Add toggle functionality for category details
    window.toggleCategoryDetails = (categoryIndex) => {
      const detailsDiv = document.getElementById(`category-details-${categoryIndex}`);
      const arrow = document.getElementById(`arrow-${categoryIndex}`);
      
      if (detailsDiv && arrow) {
        const isVisible = detailsDiv.style.display !== 'none';
        
        detailsDiv.style.display = isVisible ? 'none' : 'block';
        arrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(90deg)';
        arrow.textContent = '>';
      }
    };
    
    // Add toggle switch functionality
    modalContent.querySelectorAll('input[data-category-id]').forEach(checkbox => {
      if (!checkbox.disabled) {
        checkbox.addEventListener('change', (e) => {
          const track = e.target.nextElementSibling;  // .uc-switch-track
          const thumb = track.nextElementSibling;     // .uc-switch-thumb
          const isChecked = e.target.checked;
          
          track.style.background = isChecked ? 'var(--uc-switch-on)' : 'var(--uc-switch-off)';
          thumb.style.left = isChecked ? '24px' : '4px';
        });
      }
    });
    
    // Add event listeners
    const closeModal = () => {
      modal.remove();
      // Clean up global function
      delete window.toggleCategoryDetails;
    };
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    const closeBtn = modalContent.querySelector('#close-details-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Accept selection button
    const acceptSelectionBtn = modalContent.querySelector('#accept-selection-details');
    if (acceptSelectionBtn) {
      acceptSelectionBtn.addEventListener('click', () => {
        const selectedCategoryIds = new Set();
        const switches = modalContent.querySelectorAll('input[data-category-id]:checked');
        switches.forEach(sw => {
          const catId = parseInt(sw.getAttribute('data-category-id'), 10);
          if (!isNaN(catId)) selectedCategoryIds.add(catId);
        });

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
        
        closeModal();
      });
    }
    
    // Accept all button
    const acceptAllBtn = modalContent.querySelector('#accept-all-details');
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => {
        dsgvoBannerAPI.acceptAllCookies();
        closeModal();
      });
    }
    
    // Reject all button (GDPR compliance)
    const rejectAllBtn = modalContent.querySelector('#reject-all-details');
    if (rejectAllBtn) {
      rejectAllBtn.addEventListener('click', () => {
        dsgvoBannerAPI.necessaryOnly();
        closeModal();
      });
    }
    
    // Revoke consent button (GDPR right to withdraw)
    const revokeConsentBtn = modalContent.querySelector('#revoke-consent-details');
    if (revokeConsentBtn) {
      revokeConsentBtn.addEventListener('click', () => {
        if (confirm('Möchten Sie wirklich alle Einwilligungen widerrufen? Dies wird alle nicht-notwendigen Cookies löschen.')) {
          // Clear all consent data
          document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          localStorage.removeItem(`${CONSENT_COOKIE_NAME}_details`);
          
          // Set only necessary cookies
          dsgvoBannerAPI.necessaryOnly();
          
          // Show confirmation
          alert('Ihre Einwilligung wurde widerrufen. Nur notwendige Cookies bleiben aktiv.');
          
          closeModal();
        }
      });
    }
    
    // Add ESC key handler
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscKey);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    
    // Inject into DOM
    document.body.appendChild(modal);
    
    // Details modal opened
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
    
    // Critical inline styles for banner container (protection against external CSS)
    bannerContainer.style.cssText = `
      all: initial !important;
      position: fixed !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 9999 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      box-sizing: border-box !important;
    `;
    
    const processedHtml = replacePlaceholders(config.banner_html, config.project);

    bannerContainer.innerHTML = `
      <style>${config.banner_css || ''}</style>
      ${processedHtml}
    `;

    document.body.appendChild(bannerContainer);
    bannerContainer.addEventListener('click', handleBannerClick);
    
    // Insert category switches dynamically
    insertCategorySwitches(bannerContainer);
    
    // Restore previous consent settings if banner is reopened
    restoreConsentSettings(bannerContainer);
  }

  /**
   * Initializes the banner script.
   */
  function init() {
    // 1. Find the script tag and extract project ID and origin
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

    // 2. Expose the public API (always expose, even if cookie exists)
    window.dsgvoBanner = dsgvoBannerAPI;
    // Also attach functions directly for legacy onclick attributes
    window.acceptAllCookies = dsgvoBannerAPI.acceptAllCookies;
    window.acceptSelection = dsgvoBannerAPI.acceptSelection;
    window.necessaryOnly = dsgvoBannerAPI.necessaryOnly;

    // 3. Fetch configuration (always fetch, even if cookie exists for reopening functionality)
    const apiUrl = `${scriptOrigin}/api/config?id=${projectId}`;
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
        return response.json();
      })
      .then(config => {
        bannerConfig = config; // Always store config for potential reopening
        
        // 4. Check for existing consent cookie
        if (document.cookie.includes(`${CONSENT_COOKIE_NAME}=true`)) {
          // Existing consent found, loading services
          
          // Load services based on existing consent
          try {
            const savedDetails = localStorage.getItem(`${CONSENT_COOKIE_NAME}_details`);
            if (savedDetails) {
              const consentDetails = JSON.parse(savedDetails);
              loadConsentedServices(consentDetails.accepted_categories);
            }
          } catch (error) {
            logError('Failed to load services from existing consent:', error.message);
          }
          return;
        }
        
        // 5. Load banner if no consent cookie exists
        loadBanner(config);
      })
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
