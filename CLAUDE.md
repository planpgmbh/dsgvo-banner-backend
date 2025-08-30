# CLAUDE.md

Diese Datei bietet Anleitung für Claude Code (claude.ai/code) beim Arbeiten mit Code in diesem Repository.

## Repository-Übersicht

Dies ist ein DSGVO-konformes Cookie-Banner-Management-System, bestehend aus einem React-basierten Admin-Panel und einer Node.js-Express-API. Das System ermöglicht es, Cookie-Banner für mehrere Websites zentral zu verwalten und DSGVO-konforme Einwilligungen zu protokollieren.

## Architektur

### Monorepo-Struktur
- **`/backend`**: Node.js/Express-API mit CommonJS-Modulen
  - **Database**: MariaDB 11
  - **Auth**: JWT-basierte Authentifizierung
  - **Security**: Helmet, CORS (offen für öffentliche Banner-Integration), Rate Limiting
  - **Validation**: express-validator für Input-Validierung

- **`/project`**: React-Frontend mit TypeScript
  - **Build Tool**: Vite
  - **Styling**: Tailwind CSS
  - **Routing**: React Router DOM
  - **Icons**: Lucide React

### Docker-Setup
- **Production**: `docker-compose.yml` mit Traefik-Integration
- **Development**: `docker-compose-dev.yml` mit direkten Port-Mappings
- **Database**: MariaDB mit persistenten Volumes und Initialisierungs-SQL

## Häufige Befehle

### Development Environment
```bash
# Development-Container starten (ohne Traefik)
docker-compose -f docker-compose-dev.yml up -d --build

# Frontend Development Server (Vite)
cd project && npm run dev

# Backend starten (Node.js)
cd backend && npm start

# Logs für Development
docker-compose -f docker-compose-dev.yml logs -f [service_name]
```

### Production Testing
```bash
# Production-Container starten (mit Traefik)
docker-compose up -d --build

# Container stoppen
docker-compose down

# Production-Logs
docker-compose logs -f [service_name]
```

### Frontend-Entwicklung
```bash
cd project

# Development-Server (Port 5173)
npm run dev

# Production-Build
npm run build

# Linting
npm run lint

# Preview von Production-Build
npm run preview
```

### Backend-Entwicklung
```bash
cd backend

# Server starten
npm start  # oder npm run backend

# (Kein Hot-Reload konfiguriert - Container-Restart nötig bei Änderungen)
```

## Zugriffswege

### Development (docker-compose-dev.yml)
- **Frontend**: `http://localhost:5173`
- **Backend-API**: `http://localhost:3001/api`
- **Database**: `localhost:3319` (MariaDB)

### Production/Staging (docker-compose.yml)
- **Frontend**: `https://dsgvobanner.plan-p.com`
- **Backend-API**: `https://dsgvobanner.plan-p.com/api`
- **Database**: `localhost:3318` (MariaDB)

## API-Struktur

### Öffentliche Endpunkte (keine Auth)
- `GET /api/config?id=<project_id>` - Banner-Konfiguration abrufen
- `POST /api/consent` - Benutzer-Einwilligung speichern

### Administrative Endpunkte (JWT Auth erforderlich)
- `/api/auth/*` - Authentifizierung
- `/api/projects/*` - Projekt-Management
- `/api/projects/:id/cookies/*` - Cookie-Service-Management
- `/api/projects/:id/consent-logs` - Einwilligungs-Protokolle
- `/api/projects/:id/analytics` - Statistiken

## Umgebungsvariablen

Erstelle eine `.env`-Datei im Hauptverzeichnis:
```env
DB_NAME=dsgvobanner
DB_USER=user
DB_PASSWORD=password
MYSQL_ROOT_PASSWORD=root_password
JWT_SECRET=IhrSuperGeheimerSchlüssel
CORS_ORIGIN=https://dsgvobanner.plan-p.com
```

## Integration auf Websites

Das System generiert ein JavaScript-Snippet für die Integration:
```html
<script src="https://dsgvobanner.plan-p.com/load.js?id=123"></script>
```

Das `load.js`-Skript befindet sich in `/project/public/load.js` und wird über Nginx ausgeliefert.

### Globale JavaScript-Funktionen (load.js)
Das Banner-System stellt folgende globale Funktionen zur Verfügung:
- `window.dsgvoBanner.open()` - Banner erneut öffnen
- `window.dsgvoBanner.showDetails()` - DSGVO-Details-Modal anzeigen
- `window.dsgvoBanner.acceptAllCookies()` - Alle Cookies akzeptieren
- `window.dsgvoBanner.rejectAllCookies()` - Alle Cookies ablehnen
- `window.dsgvoBanner.withdrawConsent()` - Einwilligung widerrufen

## DSGVO-Compliance Status

### ✅ Implementierte Features (DSGVO-Sofortmaßnahmen)

**Rechtliche Compliance (Art. 7, 13, 14, 21, 22 DSGVO)**
- **Widerruf der Einwilligung** (Art. 7 Abs. 3 DSGVO) - Vollständig implementiert
  - `withdrawConsent()` Funktion mit Bestätigungsdialog
  - Komplette Cookie-Löschung und LocalStorage-Reset
  - Automatisches Banner-Reload nach Widerruf
- **"Alle ablehnen" Option** - Gleichwertige Darstellung zu "Alle akzeptieren"
- **Rechtsgrundlagen-Information** - Automatische Erkennung basierend auf Service-Provider
- **Drittland-Transfer Hinweise** - US-Unternehmen (Google, Meta, etc.) mit Warnhinweisen
- **Verantwortlicher-Information** - Data Controller Details werden angezeigt
- **Betroffenenrechte** - Vollständige DSGVO-Rechte-Auflistung im Details-Modal

**Cookie-Details-Modal mit DSGVO-Compliance**
- **Granulare Einwilligung** mit Toggle-Switches pro Kategorie
- **Klappbare Service-Details** für bessere Übersichtlichkeit
- **Rechtliche Informationen** pro Service (Rechtsgrundlage, Empfänger, Speicherdauer)
- **Automatische Drittland-Erkennung** mit entsprechenden Warnhinweisen
- **DSGVO-Rechte-Sektion** mit vollständiger Information

**Consent-Management**
- **Dynamische Cookie-Speicherdauer** basierend auf Projekt-Konfiguration
- **Vollständige Consent-Historie** mit Zeitstempeln in LocalStorage
- **Service-basiertes Script-Loading** nur bei erteilter Einwilligung
- **LocalStorage-Details** für granulare Einwilligungsverfolgung

### 🔄 Technische Implementierung

**Core-Datei: `/project/public/load.js`**
- **showDetailsModal()**: Erweiterte DSGVO-Details mit Rechtsgrundlagen-Erkennung
- **Legal Basis Detection**: Automatische Zuordnung basierend auf Provider-Namen
- **Third-Country Warnings**: USA-Transfer-Hinweise für internationale Dienste
- **Withdrawal Mechanism**: Vollständiger Consent-Widerruf mit Cookie-Löschung
- **Data Controller Display**: Projekt-spezifische Verantwortlicher-Information

**Test-Integration: `/test-website.html`**
- DSGVO-Test-Buttons für alle Funktionen
- Compliance-Feature-Checklist visuell dargestellt
- Erweiterte Test-Szenarien für Widerruf und Ablehnung

### 🎯 Nächste Entwicklungsphase (Vorbereitet)

**Backend-Erweiterungen (geplant)**
- Erweiterte Datenbank-Schema für GDPR-Metadaten
- Projekt-spezifische Data Controller Konfiguration
- Service-spezifische Rechtsgrundlagen-Verwaltung
- Erweiterte Consent-Logs mit GDPR-Compliance-Metriken

**Frontend-Admin-Panel (geplant)**
- GDPR-Konfigurationsseite pro Projekt
- Data Controller Verwaltung
- Rechtsgrundlagen-Editor für Services
- Compliance-Dashboard mit GDPR-Metriken

## Code-Konventionen

### Backend
- **Module-System**: CommonJS (`.cjs`-Dateien)
- **Struktur**: Controller-Router-Pattern
- **Validierung**: express-validator für Input-Validation
- **Error Handling**: Centralized mit catchAsync-Utility

### Frontend
- **Module-System**: ESM (TypeScript)
- **Components**: Funktionale React-Komponenten
- **Styling**: Tailwind CSS-Klassen
- **State Management**: React useState/useEffect (kein externes State Management)

## Besondere Hinweise

- **CORS-Konfiguration**: Backend hat offene CORS-Policy für öffentliche Banner-Integration
- **Database-Init**: `backend/init.sql` wird automatisch bei Container-Start ausgeführt
- **Traefik-Integration**: Production-Setup erwartet externe Traefik-Container mit `proxy`-Netzwerk
- **Rate Limiting**: 100 Requests pro Minute pro IP
- **SSL**: Wird über Traefik mit Let's Encrypt gehandhabt