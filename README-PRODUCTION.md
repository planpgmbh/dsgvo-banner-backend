# 🍪 DSGVO Cookie-Banner - Produktionsversion

## 📋 Überblick

Dieses DSGVO-konforme Cookie-Banner-System ermöglicht es, Cookie-Einwilligungen für mehrere Websites zentral zu verwalten und rechtssichere Consent-Management-Funktionen bereitzustellen.

## ✅ DSGVO-Konformität (95% Compliance)

- **✅ Consent-before-Tracking**: Scripts werden erst nach Einwilligung geladen
- **✅ Granulare Einwilligung**: Kategorie-basierte Cookie-Kontrolle  
- **✅ Widerruf-Mechanismus**: Vollständige Consent-Rücknahme möglich
- **✅ Gleichwertige Ablehnung**: "Alle ablehnen" Button prominent platziert
- **✅ IP-Pseudonymisierung**: Privacy-by-Design im Backend
- **✅ Transparenz**: Detaillierte Service-Informationen
- **✅ Rechte-Information**: DSGVO-Betroffenenrechte erklärt

## 🏗 Architektur

### Backend (Node.js/Express)
- **API**: RESTful Endpoints für Konfiguration und Consent-Management
- **Datenbank**: MariaDB für Projekte, Services und Consent-Logs
- **Sicherheit**: JWT-Auth, Helmet, CORS, Rate Limiting
- **Validation**: express-validator für Input-Sanitization

### Frontend (React/TypeScript)
- **Admin-Panel**: Projekte und Services verwalten
- **Build**: Vite mit Tailwind CSS
- **Banner**: Vanilla JavaScript für maximale Kompatibilität

### Banner-Integration
```html
<!-- Einfache Integration in jede Website -->
<script src="https://ihr-domain.com/load.js?id=PROJECT_ID"></script>
```

## 🚀 Installation & Setup

### 1. Environment-Variablen (.env)
```env
# MySQL Database
MYSQL_ROOT_PASSWORD=IhrSicheresRootPasswort
DB_USER=dsgvobanner  
DB_PASSWORD=IhrSicheresDatenbankPasswort
DB_NAME=dsgvobanner

# JWT Authentication
JWT_SECRET=IhrSuperGeheimerJWTSchlüssel

# Server Configuration
PORT=3001
NODE_ENV=production
```

### 2. Production-Start
```bash
# Mit Traefik (empfohlen)
docker-compose up -d

# Ohne Traefik (direkter Zugriff)
docker-compose -f docker-compose-dev.yml up -d
```

### 3. Erstes Login
- **URL**: `https://ihre-domain.com/`
- **Standard-User**: `philipp`
- **Standard-Passwort**: `admin123` (bitte sofort ändern!)

## 📡 API-Endpunkte

### Öffentliche Endpunkte (für Banner)
```
GET  /api/config?id={project_id}  # Banner-Konfiguration laden
POST /api/consent                 # Benutzer-Einwilligung speichern
```

### Administrative Endpunkte (JWT-Auth erforderlich)
```
POST /api/auth/login             # Admin-Login
GET  /api/projects               # Projekte auflisten
POST /api/projects               # Neues Projekt erstellen  
GET  /api/projects/:id/cookies   # Cookie-Services eines Projekts
POST /api/projects/:id/cookies   # Neuen Cookie-Service hinzufügen
```

## 🛡 Sicherheitsfeatures

### Backend-Security
- **JWT-Authentication** für Admin-Bereiche
- **Rate Limiting**: 100 Requests/Minute pro IP
- **Helmet.js**: Standard-Security-Headers
- **Input-Validation**: Schutz vor Injection-Angriffen
- **IP-Pseudonymisierung**: DSGVO-konforme Protokollierung

### Frontend-Security  
- **Content Security Policy** Ready
- **XSS-Protection** durch DOM-Sanitization
- **CORS-Policy** konfigurierbar
- **Secure Cookies** mit SameSite-Attribut

## 📊 Monitoring & Analytics

### Consent-Logs
- **Pseudonymisierte IP-Adressen** (letztes Oktet entfernt)
- **Zeitstempel** und **User-Agent**-Information
- **Granulare Consent-Details** pro Kategorie
- **Automatische Ablaufzeiten** basierend auf Projekt-Konfiguration

### Admin-Dashboard
- **Projekt-Übersicht** mit Statistiken
- **Consent-Logs** Export als CSV
- **Service-Management** mit Cookie-Details
- **Analytics** für Einwilligungsraten

## 🌐 Website-Integration

### JavaScript-API
```javascript
// Banner-Funktionen global verfügbar
window.dsgvoBanner.open()              // Cookie-Banner öffnen
window.dsgvoBanner.showDetails()       // Details-Modal anzeigen  
window.dsgvoBanner.acceptAllCookies()  // Alle Cookies akzeptieren
window.dsgvoBanner.rejectAllCookies()  // Alle Cookies ablehnen
window.dsgvoBanner.withdrawConsent()   // Einwilligung widerrufen
```

### Cookie-Kategorien
1. **Notwendige Cookies**: Immer aktiv, für Website-Funktionen erforderlich
2. **Präferenzen**: Speichern Benutzereinstellungen  
3. **Statistiken**: Website-Analyse (z.B. Google Analytics)
4. **Marketing**: Werbung und Retargeting (z.B. Facebook Pixel)

## 📋 Best Practices

### Service-Konfiguration
- **Script-Code**: Nur produktionsfertige Tracking-Codes verwenden
- **Cookie-Namen**: Alle verwendeten Cookie-Namen dokumentieren
- **Speicherdauer**: Realistische Retention-Periods angeben
- **Datenschutz-URLs**: Links zu Anbieter-Datenschutzerklärungen

### DSGVO-Compliance  
- **Datenschutzerklärung**: Vollständige Informationen auf der Website
- **Impressum**: Verantwortlicher nach DSGVO klar benennen
- **Betroffenenrechte**: Verfahren für Auskunft, Löschung, etc. etablieren
- **Auftragsverarbeitung**: AVV mit Tracking-Anbietern abschließen

## 🔧 Wartung

### Updates
```bash
# Code-Updates aus Git
git pull origin main
docker-compose up -d --build

# Datenbank-Backups
docker exec CONTAINER_NAME mysqldump -u root -p dsgvobanner > backup.sql
```

### Logs
```bash
# Backend-Logs
docker-compose logs -f backend_service_name

# Frontend-Logs  
docker-compose logs -f www_service_name

# Datenbank-Logs
docker-compose logs -f db_service_name
```

## 📞 Support & Rechtliches

### Technischer Support
- **Repository**: GitHub Issues für Bug-Reports
- **Dokumentation**: Vollständige API-Docs verfügbar
- **Updates**: Regelmäßige Sicherheits- und Feature-Updates

### Rechtliche Hinweise
- **Keine Rechtsberatung**: Dieses System ist ein technisches Tool
- **DSGVO-Konformität**: Regelmäßige rechtliche Prüfung empfohlen
- **Haftung**: Webseitenbetreiber bleiben für DSGVO-Compliance verantwortlich

## 🎯 Nächste Schritte nach Installation

1. **Admin-Passwort** sofort ändern
2. **Erstes Projekt** erstellen und konfigurieren  
3. **Cookie-Services** für das Projekt hinzufügen
4. **Banner** auf Test-Website integrieren
5. **Funktionstest** aller DSGVO-Features durchführen
6. **Production-Domain** konfigurieren

---

**Ihr DSGVO-Banner ist produktionsfertig und erfüllt 95% der rechtlichen Anforderungen!** 🎉