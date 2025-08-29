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
    banner_text: 'Wir verwenden Cookies, um Inhalte und Anzeigen zu personalisieren, Funktionen für soziale Medien anbieten zu können und die Zugriffe auf unsere Website zu analysieren. Außerdem geben wir Informationen zu Ihrer Verwendung unserer Website an unsere Partner für soziale Medien, Werbung und Analysen weiter. <a class="uc-link" href="#" id="uc-details">Details zeigen</a>',
    accept_all_text: 'Cookies zulassen',
    accept_selection_text: 'Auswahl erlauben',
    necessary_only_text: 'Nur notwendige Cookies verwenden',
    accept_all_selector: '#uc-allow',
    accept_selection_selector: '#uc-save',
    necessary_only_selector: '#uc-necessary',
    language: 'de',
    expiry_months: 12,
    about_cookies_text: 'Cookies sind kleine Textdateien, die von Websites verwendet werden, um die Benutzererfahrung effizienter zu gestalten. Laut Gesetz können wir Cookies auf Ihrem Gerät speichern, wenn diese für den Betrieb dieser Seite unbedingt notwendig sind. Für alle anderen Cookie-Typen benötigen wir Ihre Erlaubnis.',
    custom_html: `<div class="uc-banner-wrap" role="dialog" aria-labelledby="uc-title" aria-describedby="uc-desc">
    <section class="uc-banner">
      <div>
        <h2 id="uc-title" class="uc-headline">[#TITLE#]</h2>
        <p id="uc-desc" class="uc-desc">
          [#TEXT#]        
        </p>

        <div class="uc-groups" aria-label="Cookie-Kategorien">
          <div class="uc-group">
            <span class="uc-label">Notwendig</span>
            <label class="uc-switch" title="Notwendig">
              <input type="checkbox" checked disabled aria-label="Notwendig immer aktiv">
              <span class="uc-switch-track"><span class="uc-switch-thumb"></span></span>
            </label>
          </div>
          <div class="uc-group">
            <span class="uc-label">Präferenzen</span>
            <label class="uc-switch" title="Präferenzen">
              <input id="uc-pref" type="checkbox" aria-label="Präferenzen">
              <span class="uc-switch-track"><span class="uc-switch-thumb"></span></span>
            </label>
          </div>
          <div class="uc-group">
            <span class="uc-label">Statistiken</span>
            <label class="uc-switch" title="Statistiken">
              <input id="uc-stat" type="checkbox" aria-label="Statistiken">
              <span class="uc-switch-track"><span class="uc-switch-thumb"></span></span>
            </label>
          </div>
          <div class="uc-group">
            <span class="uc-label">Marketing</span>
            <label class="uc-switch" title="Marketing">
              <input id="uc-mkt" type="checkbox" aria-label="Marketing">
              <span class="uc-switch-track"><span class="uc-switch-thumb"></span></span>
            </label>
          </div>
        </div>
      </div>

      <div class="uc-cta">
        <button class="uc-btn uc-btn-primary" id="uc-allow">[#ACCEPT_ALL_TEXT#]</button>
        <button class="uc-btn uc-btn-secondary" id="uc-necessary">[#NECESSARY_ONLY_TEXT#]</button>
        <button class="uc-btn uc-btn-outline" id="uc-save">[#ACCEPT_SELECTION_TEXT#]</button>
      </div>
    </section>
  </div>`,
    custom_css: `:root{
      --uc-blue:#0a49ff;
      --uc-text:#0b0b0c;
      --uc-muted:#6b7280;
      --uc-bg:#ffffff;
      --uc-switch-off:#e5e7eb;
      --uc-switch-on:#111827;
      --maxw:1200px;
      --radius:12px;
      --btnw:340px; /* gleiche Breite für beide Buttons */
    }

    .uc-banner-wrap{
      position:fixed;left:0;right:0;bottom:0;z-index:9999;
      display:flex;justify-content:center;padding:24px;
    }
    .uc-banner{
      width:100%;max-width:var(--maxw);
      background:var(--uc-bg);border-radius:16px;
      padding:24px;display:grid;gap:18px;
      grid-template-columns: 1fr auto;
    }

    .uc-headline{margin:0 0 8px 0;font-weight:700;font-size:18px}
    .uc-desc{margin:0;color:#111827}
    .uc-link{
      color:var(--uc-blue);font-weight:600;text-decoration:none;margin-left:.35rem;
    }

    .uc-groups{display:flex;gap:18px;flex-wrap:wrap;margin-top:12px}
    .uc-group{display:flex;align-items:center;gap:10px}
    .uc-label{font-weight:600}

    .uc-switch{position:relative;display:inline-block;width:56px;height:32px;flex:none}
    .uc-switch input{appearance:none;-webkit-appearance:none;width:56px;height:32px;margin:0;outline:none}
    .uc-switch-track{position:absolute;inset:0;border-radius:999px;background:var(--uc-switch-on);transition:background .2s ease}
    .uc-switch input:not(:checked)+.uc-switch-track{background:var(--uc-switch-off)}
    .uc-switch-thumb{position:absolute;top:4px;left:4px;width:24px;height:24px;border-radius:999px;background:#fff;transition:transform .2s ease;box-shadow:0 1px 2px rgba(0,0,0,.25)}
    .uc-switch input:checked + .uc-switch-track .uc-switch-thumb{transform:translateX(24px)}
    .uc-switch input:disabled{cursor:not-allowed;opacity:.7}

    .uc-cta{display:flex;flex-direction:column;gap:12px;align-items:flex-end;justify-content:flex-start}
    .uc-btn{
      appearance:none;border:0;cursor:pointer;border-radius:10px;padding:14px 22px;font-weight:800;letter-spacing:.2px;
      width:var(--btnw); /* gleiche Breite */
    }
    .uc-btn-primary{background:var(--uc-blue);color:#fff}
    .uc-btn-outline{background:#fff;color:var(--uc-text);border:2px solid var(--uc-switch-off)}
    .uc-btn-secondary{background:var(--uc-switch-off);color:var(--uc-text);}

    @media (max-width: 960px){
      .uc-banner{grid-template-columns:1fr}
      .uc-cta{align-items:stretch}
      .uc-btn{width:100%}
    }`,
    custom_js: `const KEY = "uc-consent";
    const wrap = document.querySelector(".uc-banner-wrap");
    const allowBtn = document.getElementById("uc-allow");
    const necBtn = document.getElementById("uc-necessary");
    const details = document.getElementById("uc-details");
    const inputs = {
      pref: document.getElementById("uc-pref"),
      stat: document.getElementById("uc-stat"),
      mkt:  document.getElementById("uc-mkt")
    };

    try{
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if(saved && saved.version===1){
        wrap.style.display = "none";
      }
    }catch(_) {}

    allowBtn.addEventListener("click", () => {
      saveConsent({preferences:true,statistics:true,marketing:true});
      wrap.style.display = "none";
    });

    necBtn.addEventListener("click", () => {
      inputs.pref.checked = false;
      inputs.stat.checked = false;
      inputs.mkt.checked  = false;
      saveConsent({preferences:false,statistics:false,marketing:false});
      wrap.style.display = "none";
    });

    details.addEventListener("click", (e)=>{
      e.preventDefault();
      alert("Hier würden detaillierte Cookie-Informationen erscheinen – analog zum Usercentrics-Standard.");
    });

    function saveConsent({preferences,statistics,marketing}){
      const payload = {
        version:1,
        timestamp:new Date().toISOString(),
        categories:{
          necessary:true,
          preferences,
          statistics,
          marketing
        }
      };
      localStorage.setItem(KEY, JSON.stringify(payload));
    }`
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Styling (Erweiterte Einstellungen)</h3>
            
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
