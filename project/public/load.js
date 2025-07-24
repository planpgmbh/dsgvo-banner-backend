(function() {
  // Find the script tag and get the project ID from the 'src' attribute
  const scriptTag = document.querySelector('script[src*="load.js"]');
  if (!scriptTag) {
    console.error('DSGVO Banner: Could not find the script tag.');
    return;
  }

  const src = scriptTag.src;
  const url = new URL(src);
  const projectId = url.searchParams.get('id');
  const scriptOrigin = url.origin;

  if (!projectId) {
    console.error('DSGVO Banner: Project ID is missing in the script tag URL.');
    return;
  }

  // Store config in a scope accessible by the event handlers
  let bannerConfig = null;

  // --- Core Functions ---

  const sendConsent = (consentData) => {
    fetch(`${scriptOrigin}/api/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consentData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const banner = document.getElementById('dsgvo-banner-container');
        if (banner) banner.style.display = 'none';
        // Set a cookie to remember consent for 1 year
        document.cookie = `dsgvo_consent=true; max-age=${365 * 24 * 60 * 60}; path=/`;
      } else {
        console.error('DSGVO Banner: Failed to save consent.', data.error);
      }
    })
    .catch(error => {
      console.error('DSGVO Banner: Error sending consent.', error);
    });
  };

  const replacePlaceholders = (html, project) => {
    return html
      .replace(/\[#TITLE#\]/g, project.banner_title || '')
      .replace(/\[#TEXT#\]/g, project.banner_text || '')
      .replace(/\[#ACCEPT_ALL#\]/g, project.accept_all_text || 'Accept All')
      .replace(/\[#ACCEPT_SELECTION#\]/g, project.accept_selection_text || 'Accept Selection')
      .replace(/\[#NECESSARY_ONLY#\]/g, project.necessary_only_text || 'Necessary Only');
  };

  // --- Global Event Handlers ---
  
  // Define a global object to hold all banner-related functions
  window.dsgvoBanner = {
    acceptAllCookies: () => {
      if (!bannerConfig) return;
      const allServiceIds = bannerConfig.services.map(s => s.id);
      sendConsent({
        project_id: projectId,
        accepted_services: allServiceIds,
        is_accept_all: true
      });
    },
    
    // Add other handlers here if needed in the future
    // e.g., acceptSelection, necessaryOnly

    open: () => {
      const banner = document.getElementById('dsgvo-banner-container');
      if (banner) banner.style.display = 'block';
    },
    close: () => {
      const banner = document.getElementById('dsgvo-banner-container');
      if (banner) banner.style.display = 'none';
    }
  };
  
  // Also attach the function directly to window for legacy onclick="acceptAllCookies()" attributes
  window.acceptAllCookies = window.dsgvoBanner.acceptAllCookies;

  const loadBanner = (config) => {
    if (!config || !config.banner_html) {
      console.error('DSGVO Banner: Invalid or empty configuration received.');
      return;
    }
    
    // Store config for later use by the global event handlers
    bannerConfig = config;

    const bannerContainer = document.createElement('div');
    bannerContainer.id = 'dsgvo-banner-container';
    
    const processedHtml = replacePlaceholders(config.banner_html, config.project);

    bannerContainer.innerHTML = `
      <style>${config.banner_css || ''}</style>
      ${processedHtml}
    `;

    document.body.appendChild(bannerContainer);
  };

  // --- Main Execution ---

  const init = () => {
    const apiUrl = `${scriptOrigin}/api/config?id=${projectId}`;
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
        return response.json();
      })
      .then(loadBanner)
      .catch(error => {
        console.error('DSGVO Banner: Failed to load configuration.', error);
      });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
