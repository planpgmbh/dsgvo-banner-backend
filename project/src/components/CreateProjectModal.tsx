import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  onClose,
  onProjectCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    banner_title: 'Diese Webseite verwendet Cookies',
    banner_text: 'Wir verwenden Cookies, um Inhalte und Anzeigen zu personalisieren, Funktionen für soziale Medien anbieten zu können und die Zugriffe auf unsere Website zu analysieren. Außerdem geben wir Informationen zu Ihrer Verwendung unserer Website an unsere Partner für soziale Medien, Werbung und Analysen weiter. <a class="uc-link" href="#" id="cookie-details">Details zeigen</a>',
    accept_all_text: 'Cookies zulassen',
    accept_selection_text: 'Auswahl erlauben',
    necessary_only_text: 'Nur notwendige Cookies verwenden',
    language: 'de',
    expiry_months: 12,
    about_cookies_text: 'Cookies sind kleine Textdateien, die von Websites verwendet werden, um die Benutzererfahrung effizienter zu gestalten. Laut Gesetz können wir Cookies auf Ihrem Gerät speichern, wenn diese für den Betrieb dieser Seite unbedingt notwendig sind. Für alle anderen Cookie-Typen benötigen wir Ihre Erlaubnis.',
    custom_html: `<div id="dsgvo-banner-container" class="uc-banner-wrap" role="dialog" aria-labelledby="uc-title" aria-describedby="uc-desc">
    <section class="uc-banner">
      <div>
        <div id="uc-title" class="uc-headline">[#TITLE#]</div>
        <div id="uc-desc" class="uc-desc">[#TEXT#]</div>

        <div class="uc-groups" aria-label="Cookie-Kategorien">
          <div class="uc-group">
            <span class="uc-label">Notwendig</span>
            <label class="uc-switch" title="Notwendig">
              <input type="checkbox" checked disabled aria-label="Notwendig immer aktiv">
              <span class="uc-switch-track"><span class="uc-switch-thumb"></span></span>
            </label>
          </div>
          <!-- Dynamic category switches will be inserted here by load.js -->
        </div>
      </div>

      <div class="uc-cta">
        <button class="uc-btn uc-btn-primary" data-action="acceptAll">[#ACCEPT_ALL_TEXT#]</button>
        <button class="uc-btn uc-btn-secondary" data-action="necessaryOnly">[#NECESSARY_ONLY_TEXT#]</button>
        <button class="uc-btn uc-btn-outline" data-action="acceptSelection">[#ACCEPT_SELECTION_TEXT#]</button>
      </div>
    </section>
  </div>`,
    custom_css: `/* ==========================================
   DSGVO COOKIE BANNER - CSS KONFIGURATION
   ========================================== */

/* CSS VARIABLEN - Hier können Farben und Größen zentral angepasst werden */
:root {
  /* FARBEN */
  --uc-primary: #0a49ff;        /* Haupt-Button-Farbe (Alle akzeptieren) */
  --uc-text: #0b0b0c;          /* Haupttext-Farbe */
  --uc-text-muted: #6b7280;    /* Gedämpfte Text-Farbe */
  --uc-background: #ffffff;     /* Banner-Hintergrund */
  --uc-switch-off: #e5e7eb;    /* Switch-Farbe (aus) */
  --uc-switch-on: var(--uc-primary); /* Switch-Farbe (an) - blau */
  
  /* GRÖßEN */
  --uc-max-width: 1200px;      /* Maximale Banner-Breite */
  --uc-border-radius: 16px;    /* Banner-Rundung */
  --uc-button-width: 340px;    /* Button-Breite (Desktop) */
  
  /* SWITCH-GRÖßEN */
  --uc-switch-width: 48px;     /* Switch-Breite (kleiner) */
  --uc-switch-height: 28px;    /* Switch-Höhe (kleiner) */
  --uc-switch-thumb-size: 20px;/* Schieber-Größe (kleiner) */
  
  /* SCHRIFTARTEN */
  --uc-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --uc-font-size-title: 18px;  /* Titel-Schriftgröße */
  --uc-font-size-text: 14px;   /* Text-Schriftgröße */
  --uc-font-size-button: 14px; /* Button-Schriftgröße */
  --uc-font-weight-title: 700; /* Titel-Schriftgewicht */
  --uc-font-weight-button: 600;/* Button-Schriftgewicht */
  
  /* DETAILS-MODAL VARIABLEN */
  --uc-modal-overlay: rgba(0, 0, 0, 0.7);    /* Modal-Overlay-Farbe */
  --uc-modal-background: #ffffff;            /* Modal-Hintergrund */
  --uc-modal-border-radius: 12px;            /* Modal-Rundung */
  --uc-modal-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); /* Modal-Schatten */
  --uc-modal-max-width: 900px;               /* Modal-Maximale-Breite */
  --uc-modal-padding: 30px;                  /* Modal-Innen-Abstand */
  --uc-modal-title-size: 24px;               /* Modal-Titel-Größe */
  --uc-modal-close-color: #666;              /* Schließen-Button-Farbe */
  --uc-category-border: #e0e0e0;             /* Kategorie-Rahmen-Farbe */
  --uc-category-background: #f8f9fa;         /* Kategorie-Hintergrund */
  --uc-service-text-color: #666;             /* Service-Text-Farbe */
  --uc-service-link-color: #0066cc;          /* Service-Link-Farbe */
}

/* BANNER-CONTAINER - Positionierung am unteren Bildschirmrand */
.uc-banner-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  padding: 24px;
  font-family: var(--uc-font-family); /* Banner verwendet eigene Schriftart */
}

/* HAUPT-BANNER - Layout und Styling */
.uc-banner {
  width: 100%;
  max-width: var(--uc-max-width);
  background: var(--uc-background);
  border-radius: var(--uc-border-radius);
  padding: 24px;
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr auto; /* Text links, Buttons rechts */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* TITEL-BEREICH */
.uc-headline {
  margin: 0 0 8px 0;
  font-weight: var(--uc-font-weight-title);
  font-size: var(--uc-font-size-title);
  color: var(--uc-text);
  font-family: var(--uc-font-family);
}

/* TEXT-BEREICH */
.uc-desc {
  margin: 0;
  color: var(--uc-text);
  font-size: var(--uc-font-size-text);
  line-height: 1.5;
  font-family: var(--uc-font-family);
}

/* DETAILS-LINK ("Details zeigen") */
.uc-link {
  color: var(--uc-primary);
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.35rem;
  font-family: var(--uc-font-family);
}

/* COOKIE-SWITCHES CONTAINER */
.uc-groups {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 12px;
}

/* EINZELNE SWITCH-GRUPPE */
.uc-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* SWITCH-LABELS (Präferenzen, Statistiken, etc.) */
.uc-label {
  font-weight: 600;
  font-size: var(--uc-font-size-text);
  color: var(--uc-text);
  font-family: var(--uc-font-family);
}

/* TOGGLE-SWITCHES - Basis-Styling */
.uc-switch {
  position: relative;
  display: inline-block;
  width: var(--uc-switch-width);
  height: var(--uc-switch-height);
  flex: none;
}

.uc-switch input {
  appearance: none;
  -webkit-appearance: none;
  width: var(--uc-switch-width);
  height: var(--uc-switch-height);
  margin: 0;
  outline: none;
  cursor: pointer;
}

/* SWITCH-HINTERGRUND */
.uc-switch-track {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--uc-switch-off);
  transition: background 0.2s ease;
}

.uc-switch input:checked + .uc-switch-track {
  background: var(--uc-switch-on);
}

/* SWITCH-SCHIEBER */
.uc-switch-thumb {
  position: absolute;
  top: 4px;
  left: 4px;
  width: var(--uc-switch-thumb-size);
  height: var(--uc-switch-thumb-size);
  border-radius: 999px;
  background: #fff;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.uc-switch input:checked + .uc-switch-track .uc-switch-thumb {
  transform: translateX(20px);
}

.uc-switch input:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* BUTTON-CONTAINER */
.uc-cta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
  justify-content: flex-start;
}

/* ALLE BUTTONS - Basis-Styling */
.uc-btn {
  appearance: none;
  border: 0;
  cursor: pointer;
  border-radius: 10px;
  padding: 14px 22px;
  font-weight: var(--uc-font-weight-button);
  font-size: var(--uc-font-size-button);
  letter-spacing: 0.2px;
  width: var(--uc-button-width);
  font-family: var(--uc-font-family);
  transition: all 0.2s ease;
}

/* PRIMARY BUTTON - "Alle akzeptieren" */
.uc-btn-primary {
  background: var(--uc-primary);
  color: #fff;
}

.uc-btn-primary:hover {
  background: #0837cc; /* Dunkler bei Hover */
}

/* SECONDARY BUTTON - "Nur notwendige" */
.uc-btn-secondary {
  background: var(--uc-switch-off);
  color: var(--uc-text);
}

.uc-btn-secondary:hover {
  background: #d1d5db; /* Dunkler bei Hover */
}

/* OUTLINE BUTTON - "Auswahl speichern" */
.uc-btn-outline {
  background: #fff;
  color: var(--uc-text);
  border: 2px solid var(--uc-switch-off);
}

.uc-btn-outline:hover {
  background: #f9fafb; /* Leicht grau bei Hover */
  border-color: #9ca3af;
}

/* RESPONSIVE - Mobile Ansicht */
@media (max-width: 960px) {
  .uc-banner {
    grid-template-columns: 1fr; /* Einspaltig auf Mobile */
  }
  
  .uc-cta {
    align-items: stretch; /* Buttons über volle Breite */
  }
  
  .uc-btn {
    width: 100%; /* Buttons über volle Breite */
  }
  
  .uc-groups {
    justify-content: center; /* Switches zentrieren */
  }
}

/* ==========================================
   DETAILS-MODAL STYLING
   ========================================== */

/* MODAL-OVERLAY - Vollbild-Hintergrund */
#dsgvo-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--uc-modal-overlay);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  font-family: var(--uc-font-family); /* Modal verwendet eigene Schriftart */
}

/* MODAL-CONTAINER - Zentraler Modal-Box */
.uc-modal-content {
  background: var(--uc-modal-background);
  border-radius: var(--uc-modal-border-radius);
  max-width: var(--uc-modal-max-width);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: var(--uc-modal-shadow);
  font-family: var(--uc-font-family); /* Schriftart explizit setzen */
}

/* MODAL-HEADER - Titel und Schließen-Button */
.uc-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: var(--uc-modal-padding) var(--uc-modal-padding) 0;
}

.uc-modal-title {
  margin: 0;
  font-size: var(--uc-modal-title-size);
  color: var(--uc-text);
  font-weight: var(--uc-font-weight-title);
  font-family: var(--uc-font-family);
}

.uc-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--uc-modal-close-color);
  padding: 5px;
  line-height: 1;
  font-family: var(--uc-font-family);
}

.uc-modal-close:hover {
  color: var(--uc-text);
}

/* MODAL-BODY - Hauptinhalt */
.uc-modal-body {
  padding: 0 var(--uc-modal-padding) var(--uc-modal-padding);
}

.uc-modal-intro {
  color: var(--uc-service-text-color);
  line-height: 1.6;
  margin-bottom: 25px;
  font-family: var(--uc-font-family);
  font-size: var(--uc-font-size-text);
}

/* KATEGORIE-BEREICHE - Cookie-Kategorien */
.uc-category-container {
  margin-bottom: 20px;
  border: 1px solid var(--uc-category-border);
  border-radius: 8px;
  overflow: hidden;
}


.uc-category-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.uc-category-title {
  margin: 0;
  color: var(--uc-text);
  font-size: 18px;
  flex: 1;
  font-family: var(--uc-font-family);
  font-weight: var(--uc-font-weight-title);
}

/* KATEGORIE-TOGGLE - Switch für Kategorien */
.uc-category-toggle {
  position: relative;
  display: inline-block;
  width: var(--uc-switch-width);
  height: var(--uc-switch-height);
  flex: none;
}

.uc-category-toggle input {
  appearance: none;
  width: var(--uc-switch-width);
  height: var(--uc-switch-height);
  margin: 0;
  outline: none;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}

.uc-category-toggle input:disabled {
  cursor: not-allowed;
}

.uc-category-toggle .uc-switch-track {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--uc-switch-width);
  height: var(--uc-switch-height);
  background: var(--uc-switch-off);
  border-radius: calc(var(--uc-switch-height) / 2);
  transition: background 0.2s ease;
  z-index: 1;
}

.uc-category-toggle input:checked + .uc-switch-track {
  background: var(--uc-switch-on);
}

.uc-category-toggle .uc-switch-thumb {
  position: absolute;
  top: 4px;
  left: 4px;
  width: var(--uc-switch-thumb-size);
  height: var(--uc-switch-thumb-size);
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.2s ease;
  z-index: 1;
}

.uc-category-description {
  color: var(--uc-service-text-color);
  line-height: 1.5;
  margin-bottom: 15px;
  font-family: var(--uc-font-family);
  font-size: var(--uc-font-size-text);
}

/* KATEGORIE-HEADER - Klickbarer Bereich */
.uc-category-header {
  background: var(--uc-category-background);
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 25px;
  margin: 0;
  border-radius: 6px;
}

.uc-category-header:hover {
  background-color: rgba(0, 102, 204, 0.05);
}

/* Pfeil-Symbol für Kategorie-Aufklappen */
.uc-toggle-arrow {
  font-size: 16px;
  margin-right: 8px;
  transition: transform 0.2s ease;
  display: inline-block;
  color: var(--uc-primary);
  font-weight: bold;
}

.uc-services-details {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.uc-service-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.uc-service-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.uc-service-name {
  font-weight: 600;
  color: var(--uc-text);
  margin-bottom: 8px;
  font-family: var(--uc-font-family);
  font-size: var(--uc-font-size-text);
}

.uc-service-description {
  color: var(--uc-service-text-color);
  margin-bottom: 8px;
  line-height: 1.5;
  font-family: var(--uc-font-family);
  font-size: var(--uc-font-size-text);
}

.uc-service-info {
  font-size: 12px;
  color: var(--uc-text-muted);
  margin-bottom: 4px;
  font-family: var(--uc-font-family);
}

.uc-service-info strong {
  color: #555;
}

.uc-service-cookies {
  color: #777;
  font-family: monospace;
  font-size: 11px;
}

.uc-service-link {
  color: var(--uc-service-link-color);
  text-decoration: none;
  font-size: 12px;
  font-family: var(--uc-font-family);
}

.uc-service-link:hover {
  text-decoration: underline;
}

/* MODAL-BUTTONS - Aktions-Buttons */
.uc-modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  padding: 20px var(--uc-modal-padding);
  border-top: 1px solid #f0f0f0;
}

.uc-modal-button {
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  cursor: pointer;
  font-weight: 500;
  flex: 1; /* Gleichmäßige Verteilung über volle Breite */
  font-family: var(--uc-font-family);
  transition: all 0.2s ease;
  text-align: center;
}

/* Button-spezifische Farben */
.uc-modal-button.withdraw {
  background: #dc3545;
  color: white;
}

.uc-modal-button.withdraw:hover {
  background: #c82333;
}

.uc-modal-button.reject {
  background: #6c757d;
  color: white;
}

.uc-modal-button.reject:hover {
  background: #5a6268;
}

.uc-modal-button.selection {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e0e0e0;
}

.uc-modal-button.selection:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.uc-modal-button.accept {
  background: var(--uc-primary);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 102, 204, 0.2);
}

.uc-modal-button.accept:hover {
  background: #0052a3;
}

/* GDPR-RECHTE SEKTION */
.uc-gdpr-rights {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #f0f0f0;
}

.uc-gdpr-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--uc-text);
  margin-bottom: 15px;
  font-family: var(--uc-font-family);
}

.uc-gdpr-content {
  font-size: 13px;
  color: var(--uc-service-text-color);
  line-height: 1.6;
  font-family: var(--uc-font-family);
}

/* RESPONSIVE DESIGN - Mobile Anpassungen */
@media (max-width: 768px) {
  #dsgvo-details-modal {
    padding: 10px;
    align-items: flex-start;
  }
  
  .uc-modal-content {
    margin-top: 20px;
    max-height: calc(100vh - 40px);
  }
  
  .uc-modal-header,
  .uc-modal-body,
  .uc-modal-buttons {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .uc-modal-title {
    font-size: 20px;
  }
  
  .uc-category-header {
    padding: 15px;
  }
  
  .uc-modal-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .uc-modal-button {
    width: 100%;
    min-width: auto;
  }
  
  .uc-category-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .uc-category-toggle {
    align-self: flex-end;
  }
}`,
    custom_js: `// Banner-Funktionalität wird vollständig vom load.js übernommen
    // Hier ist kein zusätzlicher Code erforderlich`
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onProjectCreated();
      } else {
        const data = await response.json();
        setError(data.error || 'Fehler beim Erstellen des Projekts');
      }
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'expiry_months' ? parseInt(value) || 12 : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Neues Projekt erstellen
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projektname *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Meine Website"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain *
              </label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner-Titel
            </label>
            <input
              type="text"
              name="banner_title"
              value={formData.banner_title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner-Text
            </label>
            <textarea
              name="banner_text"
              value={formData.banner_text}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                "Alle akzeptieren" Button
              </label>
              <input
                type="text"
                name="accept_all_text"
                value={formData.accept_all_text}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                "Auswahl erlauben" Button
              </label>
              <input
                type="text"
                name="accept_selection_text"
                value={formData.accept_selection_text}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                "Nur notwendige" Button
              </label>
              <input
                type="text"
                name="necessary_only_text"
                value={formData.necessary_only_text}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sprache
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ablaufdauer (Monate)
              </label>
              <input
                type="number"
                name="expiry_months"
                value={formData.expiry_months}
                onChange={handleChange}
                min="1"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Styling</h3>
            
            <div className="space-y-4">
              <details className="border border-gray-200 rounded-lg">
                <summary className="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg font-medium text-gray-700 select-none">
                  HTML-Definitionen
                </summary>
                <div className="p-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom HTML
                    </label>
                    <textarea
                      name="custom_html"
                      value={formData.custom_html}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="HTML-Code für das Banner..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      HTML-Struktur des Cookie-Banners. Verwenden Sie Platzhalter wie [#TITLE#], [#TEXT#] etc.
                    </p>
                  </div>
                </div>
              </details>

              <details className="border border-gray-200 rounded-lg">
                <summary className="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg font-medium text-gray-700 select-none">
                  Cascading Style Sheets (CSS)
                </summary>
                <div className="p-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom CSS
                    </label>
                    <textarea
                      name="custom_css"
                      value={formData.custom_css}
                      onChange={handleChange}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="CSS-Styles für das Banner..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      CSS-Styles für das Aussehen des Cookie-Banners.
                    </p>
                  </div>
                </div>
              </details>

              <details className="border border-gray-200 rounded-lg">
                <summary className="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg font-medium text-gray-700 select-none">
                  JavaScript-Funktionen
                </summary>
                <div className="p-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom JavaScript
                    </label>
                    <textarea
                      name="custom_js"
                      value={formData.custom_js}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="JavaScript-Code für das Banner..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JavaScript-Funktionen für die Banner-Interaktionen.
                    </p>
                  </div>
                </div>
              </details>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Über Cookies Text
                </label>
                <textarea
                  name="about_cookies_text"
                  value={formData.about_cookies_text}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Text für den 'Über Cookies' Tab..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dieser Text wird im "Über Cookies" Tab des Banners angezeigt.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Wichtige Hinweise zum Styling</h4>
                <div className="text-sm text-yellow-700 space-y-2">
                  <p>
                    Das Banner verwendet spezielle CSS-Klassen mit dem "uc-" Prefix (z.B. .uc-banner, .uc-headline) 
                    um Konflikte mit bestehenden Website-Styles zu vermeiden.
                  </p>
                  <p>
                    Es werden ausschließlich DIV-Elemente mit CSS-Klassen verwendet, um CSS-Konflikte mit 
                    Standard-HTML-Tags (h1, h2, p) der Host-Website zu verhindern.
                  </p>
                  <p>
                    Alle Styles sind in sich geschlossen und verwenden CSS-Variablen für einfache Anpassungen.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Erstellen...' : 'Projekt erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
