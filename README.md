# DSGVO Banner Management System

Dieses Repository enthält ein vollständiges **DSGVO-konformes Cookie-Banner-System** mit erweiterten rechtlichen Compliance-Features, bestehend aus einem Admin-Panel zur Verwaltung und einem Backend zur Auslieferung der Banner-Konfigurationen und zur Speicherung von Einwilligungen.

## 🚀 Core Features

- **Zentrales Admin-Panel** zur Verwaltung mehrerer unabhängiger Projekte/Websites
- **Vollständig konfigurierbares Cookie-Banner**: Passen Sie Texte, Buttons, Kategorien und einzelne Dienste an
- **Einfache Integration**: Ein einziges JavaScript-Snippet (`load.js`) genügt zur Einbindung auf jeder Website
- **DSGVO-konforme Speicherung**: Einwilligungen werden mit einem pseudonymisierten IP-Hash und Ablaufdatum gespeichert
- **Consent-Logs**: Detaillierte Protokolle über erteilte Einwilligungen mit Export-Funktion
- **Mehrsprachige Unterstützung** (Standard: Deutsch)
- **Responsive Design** für Desktops, Tablets und Smartphones

## 🛡️ DSGVO-Compliance Features (Erweitert)

### **Rechtliche Compliance (Art. 13, 14, 21, 22 DSGVO)**
- **✅ Widerruf der Einwilligung** (Art. 7 Abs. 3 DSGVO) - Jederzeit einfach möglich
- **✅ "Alle ablehnen" Option** - Gleichwertige Darstellung zu "Alle akzeptieren" 
- **✅ Rechtsgrundlagen-Information** - Automatische Anzeige von Art. 6 DSGVO Grundlagen
- **✅ Drittland-Transfer Hinweise** - Warnung bei USA-Übertragungen (Google, Meta, etc.)
- **✅ Verantwortlicher-Information** - Data Controller Details pro Projekt
- **✅ Betroffenenrechte** - Vollständige Auflistung der Nutzerrechte

### **Cookie-Details-Modal mit vollständiger DSGVO-Compliance**
- **Granulare Einwilligung** mit Toggle-Switches pro Kategorie
- **Klappbare Service-Details** für bessere Übersichtlichkeit
- **Rechtliche Informationen** pro Service (Rechtsgrundlage, Empfänger, Speicherdauer)
- **Automatische Drittland-Erkennung** mit entsprechenden Warnhinweisen
- **Link zur Datenschutzerklärung** für vollständige Transparenz

### **Consent-Management**
- **Dynamische Cookie-Speicherdauer** basierend auf Projekt-Konfiguration
- **Vollständige Consent-Historie** mit Zeitstempeln
- **Service-basiertes Script-Loading** nur bei erteilter Einwilligung
- **LocalStorage-Details** für granulare Einwilligungsverfolgung

## 🛠️ Technologie-Stack

Das Projekt ist als Monorepo mit zwei Hauptkomponenten aufgebaut:

- **Backend (`/backend`)**:
  - **Sprache**: Node.js
  - **Framework**: Express.js
  - **Datenbank**: MariaDB (via Docker)
  - **Laufzeitumgebung**: Docker

- **Frontend (`/project`)**:
  - **Framework**: React (mit Vite)
  - **Sprache**: TypeScript
  - **Styling**: Tailwind CSS
  - **Laufzeitumgebung**: Docker (Build mit Nginx)

- **Infrastruktur & Deployment**:
  - **Containerisierung**: Docker & Docker Compose
  - **Reverse Proxy**: Traefik (für lokales Routing und SSL)

## 📂 Projektstruktur

Das Repository ist in zwei Hauptverzeichnisse unterteilt:

- **`/backend`**: Enthält die Node.js/Express-API, die für die gesamte Geschäftslogik, Datenbankinteraktion und API-Endpunkte verantwortlich ist.
- **`/project`**: Enthält die React-Anwendung, die das Admin-Panel zur Verwaltung der Banner darstellt, sowie das öffentliche `load.js`-Integrationsskript.

## 🏁 Lokale Entwicklungsumgebung starten

Die gesamte Anwendung wird über Docker Compose verwaltet, was die Einrichtung erheblich vereinfacht.

### Voraussetzungen

- Docker
- Docker Compose

### Schritt-für-Schritt-Anleitung

1.  **Repository klonen:**
    ```bash
    git clone <repository-url>
    cd dsgvobanner_backend
    ```

2.  **Umgebungsvariablen erstellen:**
    Erstellen Sie eine `.env`-Datei im Hauptverzeichnis des Projekts, indem Sie die `.env.example` (falls vorhanden) kopieren. Passen Sie die Werte, insbesondere die Datenbank-Zugangsdaten, an.
    ```env
    # .env
    DB_NAME=dsgvobanner
    DB_USER=user
    DB_PASSWORD=password
    MYSQL_ROOT_PASSWORD=root_password
    JWT_SECRET=IhrSuperGeheimerSchlüssel
    # CORS_ORIGIN ist für das Admin-Panel relevant, falls es auf einer anderen Domain als die API läuft.
    # Für das öffentliche Banner-Skript ist CORS serverseitig offen konfiguriert.
    CORS_ORIGIN=https://dsgvobanner.plan-p.com
    ```

3.  **Anwendung starten:**
    Führen Sie den folgenden Befehl im Hauptverzeichnis aus. Docker Compose wird die Images für Backend und Frontend bauen, die Container starten und die Netzwerke einrichten.
    ```bash
    docker compose up -d --build
    ```

4.  **Zugriff auf die Anwendung:**
    - **Frontend (Admin-Panel):** `https://dsgvobanner.plan-p.com` (oder die in Traefik konfigurierte URL)
    - **Backend-API:** `https://dsgvobanner.plan-p.com/api`

## 🔌 API-Dokumentation

Die API ist in öffentliche und administrative Endpunkte unterteilt. Alle Endpunkte sind unter dem Präfix `/api` erreichbar.

### Öffentliche Endpunkte (Keine Authentifizierung)

- **`GET /api/config?id=<project_id>`**: Ruft die öffentliche Konfiguration für ein bestimmtes Projekt-Banner ab. Gibt ein JSON-Objekt zurück, das `banner_html`, `banner_css` und weitere Projektdetails enthält.
- **`POST /api/consent`**: Speichert die Zustimmung eines Benutzers. Erwartet einen JSON-Body mit `project_id`, `accepted_services` (Array von IDs) und `is_accept_all` (boolean).

### Authentifizierung

- **`POST /api/auth/login`**: Authentifiziert einen Admin-Benutzer und gibt einen JWT-Token zurück.

### Administrative Endpunkte (JWT-Authentifizierung erforderlich)

Der `Authorization: Bearer <Token>`-Header ist für alle folgenden Endpunkte erforderlich.

- **Projekte (`/api/projects`)**:
  - `GET /`: Alle Projekte abrufen.
  - `POST /`: Neues Projekt erstellen.
  - `GET /:id`: Details eines Projekts abrufen.
  - `PUT /:id`: Ein Projekt aktualisieren.
  - `DELETE /:id`: Ein Projekt löschen.

- **Cookie-Management (`/api/projects/:projectId/cookies`)**:
  - `GET /`: Alle Cookie-Services für ein Projekt abrufen.
  - `POST /`: Neuen Cookie-Service hinzufügen.
  - `PUT /:cookieId`: Einen Cookie-Service aktualisieren.
  - `DELETE /:cookieId`: Einen Cookie-Service löschen.

- **Statistiken & Logs (`/api/projects/:projectId`)**:
  - `GET /consent-logs`: Zustimmungsprotokolle abrufen.
  - `GET /analytics`: Aggregierte Statistiken abrufen.

## 🔗 Frontend-Integration

Um das Banner auf einer externen Website zu integrieren, fügen Sie das folgende Skript in den `<head>`- oder `<body>`-Bereich Ihrer HTML-Seite ein. Ersetzen Sie `123` durch die ID Ihres Projekts.

```html
<script src="https://dsgvobanner.plan-p.com/load.js?id=123"></script>
```
Das Skript lädt die Konfiguration, ersetzt Platzhalter wie `[#TITLE#]` im Banner-HTML und stellt globale JavaScript-Funktionen zur Verfügung.

Um einen Link zum erneuten Öffnen des Banners bereitzustellen, können Sie die globale Funktion `window.dsgvoBanner.open()` verwenden:
```html
<a href="#" onclick="window.dsgvoBanner.open(); return false;">Cookie-Einstellungen ändern</a>
```
Die Buttons im Banner (z.B. "Alle akzeptieren") rufen ebenfalls globale Funktionen wie `window.acceptAllCookies()` auf, die vom `load.js`-Skript bereitgestellt werden.

## ♿ Barrierefreiheit & Nutzerführung

- Fokus-Management: Banner und Details-Modal setzen den Fokus korrekt und halten Tab/Shift+Tab innerhalb des Dialogs.
- Aria-Attribute: Banner als Dialog (aria-modal, aria-labelledby/-label), Details-Modal mit Tastatursteuerung (Enter/Space) pro Kategorie.
- Live-Region: Erfolgreiche Speicherung wird über eine aria-live Region angekündigt.

## 🚫 Gleichwertige Ablehnung

- Neu angelegte Projekte verwenden standardmäßig den Text „Alle ablehnen“ und stellen diesen Button gleichwertig neben „Alle akzeptieren“ dar. Bestehende Projekte können dies im HTML anpassen.

## 🧩 Debugging

- `load.js` Debug-Logs lassen sich einschalten über `?debug=1` im Script-URL oder via `localStorage.setItem('dsgvo_debug','1')`.

## ⏱️ Aufbewahrungsdauer (Retention)

- Die projektweite Einstellung `expiry_months` steuert die Gültigkeit der Einwilligung (Cookie & Server `expires_at`).
- Für den Consent-Cookie-Service wird die angezeigte „Speicherdauer“ automatisch aus `expiry_months` abgeleitet, falls dort nichts gepflegt ist.

## 🔒 Pseudonymisierung

- IP-Adressen werden für Nachweispflicht pseudonymisiert gespeichert.
  - IPv4: nur das letzte Oktett wird maskiert (z. B. `192.168.1.XXX`).
  - IPv6: nur der letzte Block wird maskiert (z. B. `2a02:...:XXXX`).

## 🧱 Consent-before-Tracking

- Drittanbieter-Dienste werden ausschließlich nach erteilter Einwilligung geladen. Vorher findet keine Script-Injektion statt; Preload/Prefetch wird nicht genutzt.

## 🗃️ Datenbank-Schema

Die Datenbank besteht aus den folgenden Haupttabellen:

- **`users`**: Administrative Benutzer.
- **`projects`**: Konfiguration für jedes DSGVO-Banner-Projekt.
- **`cookie_categories`**: Cookie-Kategorien (z.B. "Notwendig", "Marketing").
- **`cookie_services`**: Einzelne Dienste oder Skripte (z.B. "Google Analytics").
- **`consent_logs`**: Protokolle der erteilten Einwilligungen.
