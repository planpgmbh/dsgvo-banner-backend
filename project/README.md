# DSGVO Cookie Banner System

Ein vollständiges DSGVO-konformes Cookie-Banner-System mit zentraler Verwaltung für mehrere Projekte/Websites.

## 🚀 Features

- **Zentrales Admin-Panel** zur Verwaltung mehrerer Projekte
- **Vollständig konfigurierbares Cookie-Banner** (Texte, Buttons, Kategorien)
- **JavaScript-Snippet** zur einfachen Integration
- **DSGVO-konforme Speicherung** der Einwilligungen
- **Consent-Logs** mit Export-Funktion
- **Konfigurierbare Ablaufdauer** der Einwilligung
- **Link-Generator** für spätere Banner-Öffnung (kein Floating-Icon)
- **Mehrsprachige Unterstützung** (Default: Deutsch)

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind CSS
- **Integration**: JavaScript-Snippet

## 🏗️ Installation

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd dsgvo-banner-system
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Frontend starten**
   ```bash
   npm run dev
   ```

## 📋 API-Endpunkte

### Basis-URL (Produktion)
`https://dsgvobanner.plan-p.com`

### Öffentliche API (für Banner)
- `GET /api/config?id=123` - Holt Konfiguration für Projekt
- `POST /api/consent` - Speichert Einwilligung

### Admin-API (authentifiziert)
- `POST /api/auth/login` - Admin-Login
- `GET /api/projects` - Alle Projekte abrufen
- `POST /api/projects` - Neues Projekt erstellen
- `GET /api/projects/:id` - Projekt-Details abrufen
- `PUT /api/projects/:id` - Projekt aktualisieren
- `GET /api/projects/:id/consent-logs` - Consent-Logs abrufen

## 🔗 Integration

### 1. Script-Einbindung

```html
<script src="https://dsgvobanner.plan-p.com/load.js?id=123"></script>
```

### 2. Wiederöffnungs-Link

```html
<a href="#" onclick="window.dsgvoBanner.open()">Cookie-Einstellungen ändern</a>
```

## 📊 Datenschutz-Features

- ✅ Keine Cookies oder Scripts vor aktiver Zustimmung
- ✅ Zustimmung kann jederzeit geändert werden
- ✅ IP-Pseudonymisierung in Logs
- ✅ Konfigurierbare Ablaufdauer
- ✅ DSGVO-konforme Speicherung

## 🎨 Banner-Features

- **Tabs**: Zustimmung, Details, Über Cookies
- **Buttons**: Nur notwendige, Auswahl erlauben, Alle akzeptieren
- **Responsive Design** für alle Geräte
- **Kategorien mit Toggles** für detaillierte Auswahl
- **Accordion-Details** für Cookie-Kategorien

## 📱 Responsive Design

Das System ist vollständig responsive und funktioniert auf:
- Desktop-Computern
- Tablets
- Smartphones

## 🤝 Beitrag

1. Fork des Repositories
2. Feature-Branch erstellen
3. Änderungen committen
4. Pull Request erstellen

## 📄 Lizenz

MIT License - siehe LICENSE-Datei für Details.

## 🆘 Support

Bei Fragen oder Problemen:
- Issue erstellen
- E-Mail an support@plan-p.de

---

**Entwickelt mit ❤️ für DSGVO-Compliance**