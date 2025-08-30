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
    
    // Handle "Details zeigen" link
    if (target.id === 'uc-details' || target.getAttribute('href') === '#' && target.textContent.includes('Details')) {
      event.preventDefault();
      showDetailsModal();
      return;
    }

    // Check for data-action attribute first (new system)
    const action = target.getAttribute('data-action');
    if (action) {
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

    // No action matched - banner uses data-action attributes
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
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    // Generate content HTML
    let contentHTML = `
      <div style="padding: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 24px; color: #333;">Cookie-Einstellungen</h2>
          <button id="close-details-modal" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 5px;
            line-height: 1;
          ">&times;</button>
        </div>
        
        <div style="margin-bottom: 25px;">
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            ${bannerConfig.project.about_cookies_text || 'Cookies sind kleine Textdateien, die von Websites verwendet werden, um die Benutzererfahrung zu verbessern.'}
          </p>
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
        <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #f8f9fa; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h3 style="margin: 0; color: #333; font-size: 18px; flex: 1;">${category.name}</h3>
              <label style="position: relative; display: inline-block; width: 56px; height: 32px; flex: none;">
                <input 
                  type="checkbox" 
                  data-category-id="${category.id}"
                  ${isChecked ? 'checked' : ''}
                  ${isRequired ? 'disabled' : ''}
                  style="
                    appearance: none;
                    width: 56px;
                    height: 32px;
                    margin: 0;
                    outline: none;
                    cursor: ${isRequired ? 'not-allowed' : 'pointer'};
                  "
                >
                <span style="
                  position: absolute;
                  inset: 0;
                  border-radius: 999px;
                  background: ${isChecked ? '#111827' : '#e5e7eb'};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute;
                  top: 4px;
                  left: ${isChecked ? '28px' : '4px'};
                  width: 24px;
                  height: 24px;
                  border-radius: 999px;
                  background: #fff;
                  transition: left 0.2s ease;
                  box-shadow: 0 1px 2px rgba(0,0,0,.25);
                "></span>
              </label>
            </div>
            <p style="margin: 0; color: #666; font-size: 14px;">${category.description || 'Keine Beschreibung verfügbar'}</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #888;">
              ${isRequired ? 'Erforderlich (kann nicht deaktiviert werden)' : 'Optional'}
            </p>
            
            ${categoryServices.length > 0 ? `
              <button 
                type="button"
                onclick="toggleCategoryDetails(${categoryIndex})"
                id="toggle-category-${categoryIndex}"
                style="
                  background: none;
                  border: 1px solid #ddd;
                  border-radius: 4px;
                  padding: 6px 12px;
                  font-size: 12px;
                  cursor: pointer;
                  color: #666;
                  margin-top: 15px;
                "
              >
                Details anzeigen (${categoryServices.length} ${categoryServices.length === 1 ? 'Service' : 'Services'})
              </button>
              
              <div id="category-details-${categoryIndex}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
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
            <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #f0f0f0;">
              <h4 style="margin: 0 0 10px 0; color: #333; font-size: 15px; font-weight: 600;">${service.name}</h4>
              <p style="margin: 0 0 12px 0; color: #666; font-size: 13px; line-height: 1.4;">
                ${service.description || 'Keine Beschreibung verfügbar'}
              </p>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; margin-bottom: 12px;">
                ${service.provider ? `<div><strong style="color: #555;">Anbieter:</strong><br><span style="color: #777;">${service.provider}</span></div>` : ''}
                ${service.retention_period ? `<div><strong style="color: #555;">Speicherdauer:</strong><br><span style="color: #777;">${service.retention_period}</span></div>` : ''}
                ${service.purpose ? `<div><strong style="color: #555;">Zweck:</strong><br><span style="color: #777;">${service.purpose}</span></div>` : ''}
                ${service.cookie_names ? `<div><strong style="color: #555;">Cookie-Namen:</strong><br><span style="color: #777; font-family: monospace; font-size: 11px;">${service.cookie_names}</span></div>` : ''}
              </div>
              
              
              ${service.privacy_policy_url ? `
                <div style="margin-top: 10px;">
                  <a href="${service.privacy_policy_url}" target="_blank" style="color: #0066cc; text-decoration: none; font-size: 12px;">
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
          <p style="color: #888; font-style: italic; margin: 15px 0 0 0; font-size: 13px;">
            Keine Services in dieser Kategorie konfiguriert.
          </p>
        `;
      }
      
      contentHTML += `
          </div>
        </div>
      `;
    });
    
    // Add action buttons
    contentHTML += `
        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button id="revoke-consent-details" style="
              background: #dc3545;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 12px 20px;
              font-size: 15px;
              cursor: pointer;
              font-weight: 500;
              min-width: 160px;
            ">Einwilligung widerrufen</button>
            <button id="reject-all-details" style="
              background: #6c757d;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 12px 20px;
              font-size: 15px;
              cursor: pointer;
              font-weight: 500;
              min-width: 160px;
            ">Alle ablehnen</button>
            <button id="accept-selection-details" style="
              background: #f8f9fa;
              color: #333;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              padding: 12px 20px;
              font-size: 15px;
              cursor: pointer;
              font-weight: 500;
              min-width: 160px;
            ">Auswahl bestätigen</button>
            <button id="accept-all-details" style="
              background: #0066cc;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 12px 20px;
              font-size: 15px;
              cursor: pointer;
              font-weight: 600;
              min-width: 160px;
              box-shadow: 0 2px 4px rgba(0, 102, 204, 0.2);
            ">Alle bestätigen</button>
          </div>
        </div>
      </div>
    `;
    
    modalContent.innerHTML = contentHTML;
    modal.appendChild(modalContent);
    
    // Add toggle functionality for category details
    window.toggleCategoryDetails = (categoryIndex) => {
      const detailsDiv = document.getElementById(`category-details-${categoryIndex}`);
      const toggleBtn = document.getElementById(`toggle-category-${categoryIndex}`);
      
      if (detailsDiv && toggleBtn) {
        const isVisible = detailsDiv.style.display !== 'none';
        detailsDiv.style.display = isVisible ? 'none' : 'block';
        toggleBtn.textContent = isVisible ? 
          `Details anzeigen (${servicesList.filter(s => s.category_id === categoriesList[categoryIndex].id).length} ${servicesList.filter(s => s.category_id === categoriesList[categoryIndex].id).length === 1 ? 'Service' : 'Services'})` :
          'Details verbergen';
      }
    };
    
    // Add toggle switch functionality
    modalContent.querySelectorAll('input[data-category-id]').forEach(checkbox => {
      if (!checkbox.disabled) {
        checkbox.addEventListener('change', (e) => {
          const span = e.target.nextElementSibling;
          const thumb = span.nextElementSibling;
          const isChecked = e.target.checked;
          
          span.style.background = isChecked ? '#111827' : '#e5e7eb';
          thumb.style.left = isChecked ? '28px' : '4px';
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
    
    const processedHtml = replacePlaceholders(config.banner_html, config.project);

    bannerContainer.innerHTML = `
      <style>${config.banner_css || ''}</style>
      ${processedHtml}
    `;

    document.body.appendChild(bannerContainer);
    bannerContainer.addEventListener('click', handleBannerClick);
    
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
