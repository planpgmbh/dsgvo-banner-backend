import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Code, BarChart3, Settings, Save, Trash2, Eye, Cookie, ChevronDown, ChevronRight, Plus, Edit, X } from 'lucide-react';
import { BannerPreview } from './BannerPreview';
import { CreateCookieModal } from './CreateCookieModal';

interface Project {
  id: number;
  name: string;
  domain: string;
  banner_title: string;
  banner_text: string;
  accept_all_text: string;
  accept_selection_text: string;
  necessary_only_text: string;
  language: string;
  expiry_months: number;
  active: boolean;
  about_cookies_text?: string;
  custom_html?: string;
  custom_css?: string;
  custom_js?: string;
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

interface AnalyticsData {
  totalConsents: number;
  weeklyConsents: number;
  acceptanceRate: number;
  categoryBreakdown: {
    [key: string]: number;
  };
}

interface ConsentLog {
  id: number;
  project_id: number;
  consents: string;
  ip_pseudonymized: string;
  expires_at: string;
  created_at: string;
}

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectCookies, setProjectCookies] = useState<CookieService[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [consentLogs, setConsentLogs] = useState<ConsentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  
  // Editable project fields
  const [editableProject, setEditableProject] = useState<Partial<Project>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [showBannerPreview, setShowBannerPreview] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [showCreateCookieModal, setShowCreateCookieModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showEditCookieModal, setShowEditCookieModal] = useState(false);
  const [cookieToEdit, setCookieToEdit] = useState<CookieService | null>(null);

  // Fixed cookie categories
  const fixedCategories = [
    {
      id: 1,
      name: 'Notwendige Cookies',
      description: 'Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.',
      required: true,
      sort_order: 1
    },
    {
      id: 2,
      name: 'Präferenzen Cookies',
      description: 'Diese Cookies ermöglichen es der Website, sich an Ihre Einstellungen zu erinnern.',
      required: false,
      sort_order: 2
    },
    {
      id: 3,
      name: 'Statistik Cookies',
      description: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren.',
      required: false,
      sort_order: 3
    },
    {
      id: 4,
      name: 'Marketing Cookies',
      description: 'Diese Cookies werden verwendet, um Ihnen relevante Werbung zu zeigen.',
      required: false,
      sort_order: 4
    }
  ];

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchProjectCookies();
      if (activeTab === 'analytics') {
        fetchAnalyticsData();
        fetchConsentLogs();
      }
    }
  }, [id, activeTab]);

  useEffect(() => {
    if (project) {
      setEditableProject({
        name: project.name,
        domain: project.domain,
        banner_title: project.banner_title,
        banner_text: project.banner_text,
        accept_all_text: project.accept_all_text,
        accept_selection_text: project.accept_selection_text,
        necessary_only_text: project.necessary_only_text,
        language: project.language,
        expiry_months: project.expiry_months,
        active: project.active,
        about_cookies_text: project.about_cookies_text,
        custom_html: project.custom_html,
        custom_css: project.custom_css,
        custom_js: project.custom_js
      });
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectCookies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}/cookies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjectCookies(data);
      }
    } catch (error) {
      console.error('Error fetching project cookies:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!id) return;
    
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData({
          totalConsents: data.totalConsents || 0,
          weeklyConsents: 0, // Will be calculated from consentLogs
          acceptanceRate: 0, // Will be calculated from consentLogs
          categoryBreakdown: data.categoryBreakdown || {}
        });
      } else {
        console.error('Failed to fetch analytics data:', response.status);
        // Fallback data on error
        setAnalyticsData({
          totalConsents: 0,
          weeklyConsents: 0,
          acceptanceRate: 0,
          categoryBreakdown: {}
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback data on error
      setAnalyticsData({
        totalConsents: 0,
        weeklyConsents: 0,
        acceptanceRate: 0,
        categoryBreakdown: {}
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Calculate analytics from consent logs
  useEffect(() => {
    if (consentLogs.length > 0 && analyticsData) {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Calculate weekly consents (last 7 days)
      const weeklyConsents = consentLogs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= oneWeekAgo;
      }).length;
      
      // Calculate acceptance rate (percentage of consents that include more than just necessary cookies)
      let acceptedOptionalCount = 0;
      
      consentLogs.forEach(log => {
        try {
          const consentsData = JSON.parse(log.consents);
          // Check if any optional categories (2, 3, 4) are accepted
          const hasOptionalConsents = consentsData['2'] || consentsData['3'] || consentsData['4'];
          if (hasOptionalConsents) {
            acceptedOptionalCount++;
          }
        } catch (e) {
          console.error('Error parsing consents for analytics:', e);
        }
      });
      
      const acceptanceRate = consentLogs.length > 0 
        ? Math.round((acceptedOptionalCount / consentLogs.length) * 100)
        : 0;
      
      // Update analytics data with calculated values
      setAnalyticsData(prev => prev ? {
        ...prev,
        weeklyConsents,
        acceptanceRate
      } : null);
    }
  }, [consentLogs, analyticsData?.totalConsents]);

  const fetchConsentLogs = async () => {
    if (!id) return;
    
    setLogsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}/consent-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConsentLogs(data.logs || []);
      } else {
        console.error('Failed to fetch consent logs:', response.status);
        setConsentLogs([]);
      }
    } catch (error) {
      console.error('Error fetching consent logs:', error);
      setConsentLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditableProject(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async () => {
    if (!id || !editableProject) return;
    
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editableProject)
      });

      if (response.ok) {
        setSaveMessage('Projekt erfolgreich gespeichert!');
        await fetchProject();
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || 'Fehler beim Speichern des Projekts');
      }
    } catch (error) {
      setSaveError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !project) return;

    const confirmDelete = window.confirm(
      `Sind Sie sicher, dass Sie das Projekt "${project.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        navigate('/');
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || 'Fehler beim Löschen des Projekts');
      }
    } catch (error) {
      setSaveError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddCookie = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setShowCreateCookieModal(true);
  };

  const handleCookieCreated = () => {
    setShowCreateCookieModal(false);
    setSelectedCategoryId(null);
    fetchProjectCookies();
  };

  const handleEditCookie = (cookie: CookieService) => {
    setCookieToEdit(cookie);
    setShowEditCookieModal(true);
  };

  const handleCookieUpdated = () => {
    setShowEditCookieModal(false);
    setCookieToEdit(null);
    fetchProjectCookies();
  };

  const handleDeleteCookie = async (cookieId: number, cookieName: string) => {
    const confirmDelete = window.confirm(
      `Sind Sie sicher, dass Sie den Cookie-Service "${cookieName}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}/cookies/${cookieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchProjectCookies(); // Refresh the cookie list
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || 'Fehler beim Löschen des Cookies');
      }
    } catch (error) {
      setSaveError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    }
  };

  const exportLogsToCsv = () => {
    if (!consentLogs || consentLogs.length === 0) {
      alert('Keine Logs zum Exportieren vorhanden.');
      return;
    }

    // CSV Header
    const headers = ['Datum', 'IP (pseudonymisiert)', 'Zustimmungen', 'Läuft ab'];
    
    // CSV Daten
    const csvData = consentLogs.map(log => {
      let consentsData;
      try {
        // Parse once - the backend sends a JSON string
        consentsData = JSON.parse(log.consents);
      } catch (e) {
        console.error("Error parsing consents for CSV:", e, log.consents);
        consentsData = {};
      }
      
      const acceptedCategories = Object.entries(consentsData)
        .filter(([_, accepted]) => accepted)
        .map(([categoryId, _]) => {
          const categoryNames = {
            '1': 'Notwendig',
            '2': 'Präferenzen',
            '3': 'Statistik',
            '4': 'Marketing'
          };
          return categoryNames[categoryId as keyof typeof categoryNames] || `Kategorie ${categoryId}`;
        });

      return [
        new Date(log.created_at).toLocaleString('de-DE'),
        log.ip_pseudonymized,
        acceptedCategories.join('; '),
        new Date(log.expires_at).toLocaleDateString('de-DE')
      ];
    });

    // CSV String erstellen
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Blob erstellen und Download auslösen
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `consent_logs_projekt_${id}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URL freigeben
    URL.revokeObjectURL(url);
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getIntegrationCode = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
    return `<script src="${baseUrl}/load.js?id=${id}"></script>`;
  };

  const getReopenLink = () => {
    return `<a href="#" onclick="window.dsgvoBanner.open()">Cookie-Einstellungen ändern</a>`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Projekt nicht gefunden
        </h3>
        <Link
          to="/projects"
          className="text-blue-600 hover:text-blue-500"
        >
          Zurück zur Projektliste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">{project.domain}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {project.active ? 'Aktiv' : 'Inaktiv'}
          </div>
          <button
            onClick={() => setShowBannerPreview(!showBannerPreview)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            <Eye className="w-4 h-4 mr-2" />
            Vorschau
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Löschen...' : 'Projekt löschen'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4 inline-block mr-2" />
              Einstellungen
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Cookie className="w-4 h-4 inline-block mr-2" />
              Cookies
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'integration'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Code className="w-4 h-4 inline-block mr-2" />
              Integration
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline-block mr-2" />
              Statistiken
            </button>
            <button
              onClick={() => setActiveTab('styling')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'styling'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4 inline-block mr-2" />
              Styling
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Save/Error Messages */}
              {saveMessage && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-600">{saveMessage}</p>
                </div>
              )}
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{saveError}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Projekt-Einstellungen
                </h3>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projektname *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editableProject.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain *
                  </label>
                  <input
                    type="text"
                    name="domain"
                    value={editableProject.domain || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={editableProject.banner_title || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner-Text
                </label>
                <textarea
                  name="banner_text"
                  value={editableProject.banner_text || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "Über Cookies" Text
                </label>
                <textarea
                  name="about_cookies_text"
                  value={editableProject.about_cookies_text || ''}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cookies sind kleine Textdateien, die von Websites verwendet werden, um die Benutzererfahrung effizienter zu gestalten..."
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
                    value={editableProject.accept_all_text || ''}
                    onChange={handleInputChange}
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
                    value={editableProject.accept_selection_text || ''}
                    onChange={handleInputChange}
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
                    value={editableProject.necessary_only_text || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sprache
                  </label>
                  <select
                    name="language"
                    value={editableProject.language || 'de'}
                    onChange={handleInputChange}
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
                    value={editableProject.expiry_months || 12}
                    onChange={handleInputChange}
                    min="1"
                    max="24"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={editableProject.active || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Projekt aktiv
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'styling' && (
            <div className="space-y-6">
              {/* Save/Error Messages */}
              {saveMessage && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-600">{saveMessage}</p>
                </div>
              )}
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{saveError}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Banner-Styling anpassen
                </h3>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Wichtige Hinweise zum Styling
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Verwenden Sie Platzhalter wie [#TITLE#], [#TEXT#], [#LANGUAGE#] für dynamische Inhalte</li>
                  <li>• CSS wird global angewendet - verwenden Sie spezifische Selektoren</li>
                  <li>• JavaScript-Funktionen sollten keine Konflikte mit bestehenden Funktionen verursachen</li>
                  <li>• Testen Sie Ihre Änderungen immer in der Vorschau</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML-Definition des Einwilligungsbanners
                </label>
                <textarea
                  name="custom_html"
                  value={editableProject.custom_html || ''}
                  onChange={handleInputChange}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={`<div id="cookiebanner" lang="[#LANGUAGE#]" dir="[#TEXTDIRECTION#]" ng-non-bindable>
  <div id="c-left">
    <p class="c-header">[#TITLE#]</p>
    <p class="c-message">[#TEXT#]</p>
  </div>
  <div id="c-right">
    <a href="javascript:void(0)" onclick="acceptAllCookies()" class="c-button">OK</a>
  </div>
  <div style="clear:both"></div>
</div>`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Verfügbare Platzhalter: [#TITLE#], [#TEXT#], [#LANGUAGE#], [#TEXTDIRECTION#]
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cascading Style Sheet (CSS)
                </label>
                <textarea
                  name="custom_css"
                  value={editableProject.custom_css || ''}
                  onChange={handleInputChange}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={`@media screen and (max-width:720px) {
  #cookiebanner a.c-button { 
    width:100%; 
    box-sizing:border-box; 
    text-align:center; 
    margin-bottom:20px;
  } 
  #c-right { 
    float:none;
  }
  #c-left { 
    float:none;
  }   
  #cookiebanner p.c-message { 
    margin-bottom:20px;
  }   
}    

@media screen and (min-width:720px) {
  #cookiebanner #c-left { 
    float:left; 
    max-width:80%;
  }
  #cookiebanner #c-right { 
    float:right; 
  }
}

#cookiebanner { 
  box-sizing: border-box; 
  background-color:rgb(36,36,39); 
  opacity: 0.9; 
  width:100%; 
  padding:25px 40px; 
  position: fixed; 
  z-index: 2147483645; 
  bottom:0px;
}

#cookiebanner p { 
  font-size:14px; 
  line-height:1.4;
}

#cookiebanner .c-header { 
  text-transform:uppercase; 
  color:#fff; 
  font-weight:bold; 
  margin-bottom:4px;
}

#cookiebanner p.c-message {
  font-size:14px; 
  color:#999;
}

#cookiebanner a { 
  font-weight:bold; 
  color:#999;
}

#cookiebanner a:hover { 
  color:#fff;
}

#cookiebanner a.c-button { 
  border-radius: 4px;
  background-color: rgb(255,255,255);
  box-shadow: 0 2px 0 0 rgb(221,221,221);
  border:1px solid rgb(221,221,221);
  padding:12px 60px;
  text-decoration:none;
  display:inline-block;
  vertical-align:middle;
  margin-top:10px;
  color:#666;
  font-size:16px;
  transition:.2s;
}

#cookiebanner a.c-button:hover { 
  box-shadow:none; 
  background-color:#f8f8f8;
}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JavaScript-Funktionen
                </label>
                <textarea
                  name="custom_js"
                  value={editableProject.custom_js || ''}
                  onChange={handleInputChange}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={`var cookieBannerSliderPos = 0;

function showCookieBanner() {
    var cookiebanner = document.getElementById("cookiebanner");
    var dialogHeight = parseInt(cookiebanner.offsetHeight);
    cookiebanner.style.bottom = (cookieBannerSliderPos - dialogHeight) + "px";
    cookieBannerSliderPos += 4;
    if (cookieBannerSliderPos < dialogHeight) {
        setTimeout(function () {
            showCookieBanner();
        }, 1);
    } else {
        cookieBannerSliderPos = 0;
        cookiebanner.style.bottom = "0px";
    }
}

function hideCookieBanner() {
    var cookiebanner = document.getElementById("cookiebanner");
    cookiebanner.style.display = "none";
}

function acceptAllCookies() {
    // Hier können Sie die Logik für das Akzeptieren aller Cookies implementieren
    hideCookieBanner();
}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Stellen Sie sicher, dass Ihre JavaScript-Funktionen keine Konflikte mit bestehenden Funktionen verursachen.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Cookie-Verwaltung
                </h3>
                <span className="text-sm text-gray-600">
                  {fixedCategories.length} Standard-Kategorien
                </span>
              </div>
              
              <div className="space-y-4">
                {fixedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {expandedCategory === category.id ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                        <h4 className="font-medium text-gray-900">
                          {category.name}
                        </h4>
                      </div>
                    </div>
                    
                    {expandedCategory === category.id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-4 mt-3">
                          {category.description}
                        </p>
                        
                        <div className="space-y-3">
                          {projectCookies
                            .filter(cookie => cookie.category_id === category.id)
                            .map((cookie) => (
                              <div
                                key={cookie.id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 mb-1">
                                      {cookie.name}
                                    </h5>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {cookie.description}
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      {cookie.provider && (
                                        <span>Anbieter: {cookie.provider}</span>
                                      )}
                                      {cookie.purpose && (
                                        <span>Zweck: {cookie.purpose}</span>
                                      )}
                                      {cookie.retention_period && (
                                        <span>Speicherdauer: {cookie.retention_period}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex space-x-1 ml-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCookie(cookie);
                                      }}
                                      className="p-1 text-gray-400 hover:text-blue-600"
                                      title="Cookie bearbeiten"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCookie(cookie.id, cookie.name);
                                      }}
                                      className="p-1 text-gray-400 hover:text-red-600"
                                      title="Cookie löschen"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          
                          {projectCookies.filter(cookie => cookie.category_id === category.id).length === 0 && (
                            <div className="text-center py-4">
                              <span className="text-sm text-gray-500">
                                Keine Cookies konfiguriert
                              </span>
                            </div>
                          )}
                          
                          <div className="flex justify-center pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddCookie(category.id);
                              }}
                              className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Cookie hinzufügen
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integration' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Einbindung auf Ihrer Website
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Fügen Sie diesen Code in den <code>&lt;head&gt;</code>-Bereich Ihrer Website ein:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Einbindungscode
                    </span>
                    <button
                      onClick={() => copyToClipboard(getIntegrationCode())}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Kopieren
                    </button>
                  </div>
                  <code className="text-sm text-gray-800 font-mono">
                    {getIntegrationCode()}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Erneutes Öffnen des Banners
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Verwenden Sie diesen Link, um das Banner erneut zu öffnen (z.B. im Footer):
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Wiederöffnungs-Link
                    </span>
                    <button
                      onClick={() => copyToClipboard(getReopenLink())}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Kopieren
                    </button>
                  </div>
                  <code className="text-sm text-gray-800 font-mono">
                    {getReopenLink()}
                  </code>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Wichtige Hinweise
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Der Banner erscheint automatisch bei ersten Besuch</li>
                  <li>• Einwilligungen werden {project.expiry_months} Monate gespeichert</li>
                  <li>• Kein Floating-Icon - nur der Link öffnet das Banner erneut</li>
                  <li>• Alle Skripte werden erst nach Einwilligung geladen</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Einwilligungsstatistiken
                </h3>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analyticsData?.totalConsents || 0}
                      </div>
                      <div className="text-sm text-blue-600">
                        Einwilligungen gesamt
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analyticsData?.weeklyConsents || 0}
                      </div>
                      <div className="text-sm text-green-600">
                        Diese Woche
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {analyticsData?.acceptanceRate || 0}%
                      </div>
                      <div className="text-sm text-purple-600">
                        Akzeptanzrate
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Aktuelle Consent-Logs
                  </h4>
                  <button
                    onClick={exportLogsToCsv}
                    disabled={!consentLogs || consentLogs.length === 0}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Als CSV exportieren
                  </button>
                </div>
                {logsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : consentLogs.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 text-center">
                      Keine Consent-Logs vorhanden
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Datum
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              IP (pseudonymisiert)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Zustimmungen
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Läuft ab
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {consentLogs.slice(0, 10).map((log) => {
                            let consentsData;
                            try {
                              // Parse once - the backend sends a JSON string
                              consentsData = JSON.parse(log.consents);
                            } catch (e) {
                              console.error("Error parsing consents:", e, log.consents);
                              consentsData = {};
                            }
                            
                            const acceptedCategories = Object.entries(consentsData)
                              .filter(([_, accepted]) => accepted)
                              .map(([categoryId, _]) => {
                                const categoryNames = {
                                  '1': 'Notwendig',
                                  '2': 'Präferenzen',
                                  '3': 'Statistik',
                                  '4': 'Marketing'
                                };
                                return categoryNames[categoryId as keyof typeof categoryNames] || `Kategorie ${categoryId}`;
                              });

                            return (
                              <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(log.created_at).toLocaleString('de-DE')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {log.ip_pseudonymized}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex flex-wrap gap-1">
                                    {acceptedCategories.map((category, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                      >
                                        {category}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(log.expires_at).toLocaleDateString('de-DE')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {consentLogs.length > 10 && (
                      <div className="bg-gray-50 px-6 py-3 text-center">
                        <p className="text-sm text-gray-500">
                          Zeige die neuesten 10 von {consentLogs.length} Einträgen
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateCookieModal && selectedCategoryId && (
        <CreateCookieModal
          projectId={id!}
          categoryId={selectedCategoryId}
          categoryName={fixedCategories.find(c => c.id === selectedCategoryId)?.name || ''}
          onClose={() => {
            setShowCreateCookieModal(false);
            setSelectedCategoryId(null);
          }}
          onCookieCreated={handleCookieCreated}
        />
      )}

      {showEditCookieModal && cookieToEdit && (
        <CreateCookieModal
          projectId={id!}
          categoryId={cookieToEdit.category_id}
          categoryName={fixedCategories.find(c => c.id === cookieToEdit.category_id)?.name || ''}
          initialCookieData={cookieToEdit}
          onClose={() => {
            setShowEditCookieModal(false);
            setCookieToEdit(null);
          }}
          onCookieCreated={handleCookieUpdated}
        />
      )}

      {showBannerPreview && (
        <BannerPreview
          project={editableProject}
          projectCookies={projectCookies}
          fixedCategories={fixedCategories}
          onClose={() => setShowBannerPreview(false)}
        />
      )}
    </div>
  );
};