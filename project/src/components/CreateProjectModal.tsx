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
    banner_title: 'Cookie-Einstellungen',
    banner_text: 'Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten.',
    accept_all_text: 'Alle akzeptieren',
    accept_selection_text: 'Auswahl erlauben',
    necessary_only_text: 'Nur notwendige Cookies',
    language: 'de',
    expiry_months: 12,
    about_cookies_text: 'Cookies sind kleine Textdateien, die von Websites verwendet werden, um die Benutzererfahrung effizienter zu gestalten. Laut Gesetz können wir Cookies auf Ihrem Gerät speichern, wenn diese für den Betrieb dieser Seite unbedingt notwendig sind. Für alle anderen Cookie-Typen benötigen wir Ihre Erlaubnis.',
    custom_html: '<div id="cookiebanner" lang="[#LANGUAGE#]" dir="[#TEXTDIRECTION#]" ng-non-bindable>\n  <div id="c-left">\n    <p class="c-header">[#TITLE#]</p>\n    <p class="c-message">[#TEXT#]</p>\n  </div>\n  <div id="c-right">\n    <a href="javascript:void(0)" onclick="acceptAllCookies()" class="c-button">OK</a>\n  </div>\n  <div style="clear:both"></div>\n</div>',
    custom_css: '@media screen and (max-width:720px) {\n  #cookiebanner a.c-button { \n    width:100%; \n    box-sizing:border-box; \n    text-align:center; \n    margin-bottom:20px;\n  } \n  #c-right { \n    float:none;\n  }\n  #c-left { \n    float:none;\n  }   \n  #cookiebanner p.c-message { \n    margin-bottom:20px;\n  }   \n}    \n\n@media screen and (min-width:720px) {\n  #cookiebanner #c-left { \n    float:left; \n    max-width:80%;\n  }\n  #cookiebanner #c-right { \n    float:right; \n  }\n}\n\n#cookiebanner { \n  box-sizing: border-box; \n  background-color:rgb(36,36,39); \n  opacity: 0.9; \n  width:100%; \n  padding:25px 40px; \n  position: fixed; \n  z-index: 2147483645; \n  bottom:0px;\n}\n\n#cookiebanner p { \n  font-size:14px; \n  line-height:1.4;\n}\n\n#cookiebanner .c-header { \n  text-transform:uppercase; \n  color:#fff; \n  font-weight:bold; \n  margin-bottom:4px;\n}\n\n#cookiebanner p.c-message {\n  font-size:14px; \n  color:#999;\n}\n\n#cookiebanner a { \n  font-weight:bold; \n  color:#999;\n}\n\n#cookiebanner a:hover { \n  color:#fff;\n}\n\n#cookiebanner a.c-button { \n  border-radius: 4px;\n  background-color: rgb(255,255,255);\n  box-shadow: 0 2px 0 0 rgb(221,221,221);\n  border:1px solid rgb(221,221,221);\n  padding:12px 60px;\n  text-decoration:none;\n  display:inline-block;\n  vertical-align:middle;\n  margin-top:10px;\n  color:#666;\n  font-size:16px;\n  transition:.2s;\n}\n\n#cookiebanner a.c-button:hover { \n  box-shadow:none; \n  background-color:#f8f8f8;\n}',
    custom_js: 'var cookieBannerSliderPos = 0;\n\nfunction showCookieBanner() {\n    var cookiebanner = document.getElementById("cookiebanner");\n    var dialogHeight = parseInt(cookiebanner.offsetHeight);\n    cookiebanner.style.bottom = (cookieBannerSliderPos - dialogHeight) + "px";\n    cookieBannerSliderPos += 4;\n    if (cookieBannerSliderPos < dialogHeight) {\n        setTimeout(function () {\n            showCookieBanner();\n        }, 1);\n    } else {\n        cookieBannerSliderPos = 0;\n        cookiebanner.style.bottom = "0px";\n    }\n}\n\nfunction hideCookieBanner() {\n    var cookiebanner = document.getElementById("cookiebanner");\n    cookiebanner.style.display = "none";\n}\n\nfunction acceptAllCookies() {\n    // Hier können Sie die Logik für das Akzeptieren aller Cookies implementieren\n    hideCookieBanner();\n}'
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