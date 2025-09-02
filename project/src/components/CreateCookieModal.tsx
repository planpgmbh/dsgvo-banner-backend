import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateCookieModalProps {
  projectId: string;
  categoryId: number;
  categoryName: string;
  initialCookieData?: CookieService;
  onClose: () => void;
  onCookieCreated: () => void;
}

interface CookieService {
  id: number;
  project_id: number;
  category_id: number;
  name: string;
  description: string;
  provider: string;
  cookie_names: string;
  script_code: string;
  privacy_policy_url: string;
  retention_period: string;
  purpose: string;
  created_at: string;
  updated_at: string;
}

export const CreateCookieModal: React.FC<CreateCookieModalProps> = ({
  projectId,
  categoryId,
  categoryName,
  initialCookieData,
  onClose,
  onCookieCreated
}) => {
  const [formData, setFormData] = useState({
    name: initialCookieData?.name || '',
    description: initialCookieData?.description || '',
    provider: initialCookieData?.provider || '',
    cookie_names: initialCookieData?.cookie_names || '',
    script_code: initialCookieData?.script_code || '',
    privacy_policy_url: initialCookieData?.privacy_policy_url || '',
    retention_period: initialCookieData?.retention_period || '',
    purpose: initialCookieData?.purpose || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!initialCookieData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${import.meta.env.VITE_API_BASE_URL}/projects/${projectId}/cookies/${initialCookieData.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/projects/${projectId}/cookies`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(isEditing ? {
          ...formData,
          category_id: categoryId
        } : {
          ...formData,
          category_id: categoryId
        })
      });

      if (response.ok) {
        onCookieCreated();
      } else {
        const data = await response.json();
        setError(data.error || `Fehler beim ${isEditing ? 'Aktualisieren' : 'Erstellen'} des Cookies`);
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
      [name]: value
    }));
  };

  // Vordefinierte Cookie-Templates
  const cookieTemplates = [
    {
      name: 'Google Analytics',
      description: 'Web-Analyse-Tool von Google zur Erfassung von Website-Statistiken',
      provider: 'Google LLC',
      cookie_names: '_ga, _gid, _gat',
      purpose: 'Website-Analyse und Statistiken',
      privacy_policy_url: 'https://policies.google.com/privacy',
      retention_period: '24 Monate'
    },
    {
      name: 'Google Tag Manager',
      description: 'Tag-Management-System von Google',
      provider: 'Google LLC',
      cookie_names: '_gtm',
      purpose: 'Tag-Verwaltung und Tracking',
      privacy_policy_url: 'https://policies.google.com/privacy',
      retention_period: '24 Monate'
    },
    {
      name: 'Facebook Pixel',
      description: 'Tracking-Tool von Meta für Werbezwecke',
      provider: 'Meta Platforms Inc.',
      cookie_names: '_fbp, _fbc',
      purpose: 'Werbung und Remarketing',
      privacy_policy_url: 'https://www.facebook.com/privacy/policy/',
      retention_period: '90 Tage'
    },
    {
      name: 'Matomo',
      description: 'Datenschutzfreundliche Web-Analyse-Software',
      provider: 'Eigener Server / Matomo',
      cookie_names: '_pk_id, _pk_ses, _pk_ref',
      purpose: 'Website-Analyse (datenschutzkonform)',
      privacy_policy_url: 'https://matomo.org/privacy-policy/',
      retention_period: '13 Monate (_pk_id), 30 Minuten (_pk_ses)'
    }
  ];

  const applyTemplate = (template: typeof cookieTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      ...template
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? `Cookie "${initialCookieData?.name}" bearbeiten` : `Cookie zu "${categoryName}" hinzufügen`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Cookie Templates */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Schnellauswahl (Vorlagen):
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {cookieTemplates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name des Dienstes *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Google Analytics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anbieter
                </label>
                <input
                  type="text"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Google LLC"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kurze Beschreibung des Dienstes und seiner Funktion"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cookie-Namen
                </label>
                <input
                  type="text"
                  name="cookie_names"
                  value={formData.cookie_names}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. _ga, _gid, _gat (durch Komma getrennt)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zweck
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Website-Analyse, Werbung"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datenschutzerklärung URL
                </label>
                <input
                  type="url"
                  name="privacy_policy_url"
                  value={formData.privacy_policy_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speicherdauer
                </label>
                <input
                  type="text"
                  name="retention_period"
                  value={formData.retention_period}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 24 Monate, 30 Tage"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JavaScript-Code / Shortcode
              </label>
              <textarea
                name="script_code"
                value={formData.script_code}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="<!-- Google Analytics -->
<script async src='https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dieser Code wird ausgeführt, wenn der Nutzer der entsprechenden Cookie-Kategorie zustimmt.
              </p>
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
                {loading ? 'Speichern...' : (isEditing ? 'Cookie aktualisieren' : 'Cookie hinzufügen')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
