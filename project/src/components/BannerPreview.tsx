import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import '../styles/banner.css';

interface Category {
  id: number;
  name: string;
  description: string;
  required: boolean;
  sort_order: number;
}

interface CookieService {
  id: number;
  name: string;
  description: string;
  provider?: string;
  purpose?: string;
  retention_period?: string;
  cookie_names?: string;
  privacy_policy_url?: string;
  category_id: number;
}

interface BannerPreviewProps {
  project: {
    banner_title?: string;
    banner_text?: string;
    accept_all_text?: string;
    accept_selection_text?: string;
    necessary_only_text?: string;
    about_cookies_text?: string;
    language?: string;
    custom_html?: string;
    custom_css?: string;
    custom_js?: string;
    categories?: Category[];
    cookies?: CookieService[];
  };
}

export const BannerPreview: React.FC<BannerPreviewProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState('consent');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const categories = project.categories || [];
  const cookies = project.cookies || [];

  const getDefaultText = (key: string) => {
    const defaults = {
      banner_title: 'Cookie-Einstellungen',
      banner_text: 'Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten.',
      accept_all_text: 'Alle akzeptieren',
      accept_selection_text: 'Auswahl erlauben',
      necessary_only_text: 'Nur notwendige Cookies',
      about_cookies_text: 'Cookies sind kleine Textdateien, die von Websites verwendet werden, um die Benutzererfahrung zu verbessern. Diese Website verwendet verschiedene Arten von Cookies. Einige Cookies werden von Drittanbietern platziert, die auf unseren Seiten erscheinen.'
    };
    return project[key as keyof typeof project] || defaults[key as keyof typeof defaults];
  };

  // Function to replace placeholders in custom HTML
  const processCustomHtml = (html: string) => {
    const language = project.language || 'de';
    const textDirection = language === 'ar' || language === 'he' ? 'rtl' : 'ltr';
    
    return html
      .replace(/\[#LANGUAGE#\]/g, language)
      .replace(/\[#TEXTDIRECTION#\]/g, textDirection)
      .replace(/\[#TITLE#\]/g, getDefaultText('banner_title'))
      .replace(/\[#TEXT#\]/g, getDefaultText('banner_text'))
      .replace(/\[#ACCEPT_ALL#\]/g, getDefaultText('accept_all_text'))
      .replace(/\[#ACCEPT_SELECTION#\]/g, getDefaultText('accept_selection_text'))
      .replace(/\[#NECESSARY_ONLY#\]/g, getDefaultText('necessary_only_text'));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Custom HTML Preview or Default Banner */}
          {project.custom_html ? (
            <div className="relative">
              {/* Custom CSS */}
              {project.custom_css && (
                <style dangerouslySetInnerHTML={{ __html: project.custom_css }} />
              )}
              
              {/* Custom HTML with processed placeholders */}
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: processCustomHtml(project.custom_html) 
                }} 
              />
              
              {/* Note about custom JavaScript */}
              {project.custom_js && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Hinweis:</strong> Custom JavaScript wird in der Vorschau aus Sicherheitsgründen nicht ausgeführt. 
                    Es wird nur im Live-Banner auf der Website aktiv sein.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Default Banner Preview */
            <div className="dsgvo-modal relative">
              <div className="dsgvo-tabs">
                <button
                  className={`dsgvo-tab ${activeTab === 'consent' ? 'active' : ''}`}
                  onClick={() => setActiveTab('consent')}
                >
                  Zustimmung
                </button>
                <button
                  className={`dsgvo-tab ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={`dsgvo-tab ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  Über Cookies
                </button>
              </div>

              <div className="dsgvo-content">
                <h2 className="text-xl font-bold mb-4">{getDefaultText('banner_title')}</h2>
                
                <div className={`dsgvo-tab-content ${activeTab === 'consent' ? 'active' : ''}`}>
                  <p>{getDefaultText('banner_text')}</p>
                </div>

                <div className={`dsgvo-tab-content ${activeTab === 'details' ? 'active' : ''}`}>
                  {categories.map((category) => {
                    const categoryCookies = cookies.filter(cookie => cookie.category_id === category.id);
                    
                    return (
                      <div key={category.id} className="dsgvo-category">
                        <div className="dsgvo-category-header">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className="flex items-center space-x-1 text-left"
                            >
                              {expandedCategory === category.id ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                              <h3>{category.name}</h3>
                            </button>
                          </div>
                          <label className="dsgvo-switch">
                            <input type="checkbox" checked={category.required} disabled={category.required} />
                            <span className="dsgvo-slider"></span>
                          </label>
                        </div>
                        <p>{category.description}</p>
                        
                        {expandedCategory === category.id && categoryCookies.length > 0 && (
                          <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
                            {categoryCookies.map((cookie) => (
                              <div key={cookie.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{cookie.name}</h4>
                                  {cookie.privacy_policy_url && (
                                    <a
                                      href={cookie.privacy_policy_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Datenschutzerklärung öffnen"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                </div>
                                <p className="text-gray-600 mb-2">{cookie.description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                                  {cookie.provider && (
                                    <div>
                                      <span className="font-medium">Anbieter:</span> {cookie.provider}
                                    </div>
                                  )}
                                  {cookie.purpose && (
                                    <div>
                                      <span className="font-medium">Zweck:</span> {cookie.purpose}
                                    </div>
                                  )}
                                  {cookie.retention_period && (
                                    <div>
                                      <span className="font-medium">Speicherdauer:</span> {cookie.retention_period}
                                    </div>
                                  )}
                                  {cookie.cookie_names && (
                                    <div>
                                      <span className="font-medium">Cookie-Namen:</span> {cookie.cookie_names}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {expandedCategory === category.id && categoryCookies.length === 0 && (
                          <div className="mt-3 text-center py-2 text-sm text-gray-500 border-t border-gray-200 pt-3">
                            Keine Cookies in dieser Kategorie konfiguriert
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {categories.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Keine Cookie-Kategorien konfiguriert
                    </div>
                  )}
                </div>

                <div className={`dsgvo-tab-content ${activeTab === 'about' ? 'active' : ''}`}>
                  <div dangerouslySetInnerHTML={{ 
                    __html: getDefaultText('about_cookies_text').replace(/\n/g, '</p><p>') 
                  }} />
                </div>
              </div>

              <div className="dsgvo-buttons">
                <button className="dsgvo-btn dsgvo-btn-secondary">
                  {getDefaultText('necessary_only_text')}
                </button>
                <button className="dsgvo-btn dsgvo-btn-primary">
                  {getDefaultText('accept_selection_text')}
                </button>
                <button className="dsgvo-btn dsgvo-btn-success">
                  {getDefaultText('accept_all_text')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};