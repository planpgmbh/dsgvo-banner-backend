# Entwickler-Dokumentation: DSGVO-Banner-Backend-API

Dieses Dokument beschreibt die Architektur, die Endpunkte und die Nutzung des DSGVO-Banner-Backends.

## 1. Grundlegende Architektur

Das Backend ist eine Node.js/Express-Anwendung, die in einem Docker-Container läuft. Sie ist mit einer MariaDB-Datenbank verbunden, die in einem separaten Docker-Container betrieben wird. Die gesamte Umgebung wird über eine `docker-compose.yml`-Datei gesteuert.

- **Basis-URL (Lokal):** `http://localhost:3001`
- **Basis-URL (Produktion):** `https://dsgvobanner.plan-p.com` (oder die konfigurierte Domain)

## 2. Authentifizierung

Der Zugriff auf administrative Endpunkte ist durch JSON Web Tokens (JWT) geschützt. Der Workflow ist wie folgt:

1.  **Login:** Senden Sie eine `POST`-Anfrage mit `username` und `password` an den Login-Endpunkt.
2.  **Token erhalten:** Der Server antwortet mit einem JWT-Token.
3.  **Token verwenden:** Fügen Sie bei allen nachfolgenden Anfragen an geschützte Endpunkte den folgenden HTTP-Header hinzu: `Authorization: Bearer <Ihr-JWT-Token>`

**Test-Benutzer (aus `init.sql`):**

- **Benutzername:** `philipp`
- **Passwort:** `17jbHaar$!`

## 3. API-Endpunkte

### Öffentliche Endpunkte (keine Authentifizierung erforderlich)

- **`GET /api/config?id=<project_id>`**
  - **Zweck:** Ruft die öffentliche Konfiguration für ein bestimmtes Projekt-Banner ab.
  - **Antwort:** Ein JSON-Objekt mit den Details zum Projekt, den Cookie-Kategorien und den Services.

- **`POST /api/consent`**
  - **Zweck:** Speichert die Zustimmung eines Benutzers in der Datenbank.
  - **Body (JSON):**
    ```json
    {
      "project_id": 1,
      "consents": { "1": true, "analytics": false },
      "ip": "123.123.123.123"
    }
    ```
  - **Antwort:** Bestätigung und Ablaufdatum der Zustimmung.

### Authentifizierungs-Endpunkt

- **`POST /api/auth/login`**
  - **Zweck:** Authentifiziert einen Benutzer und gibt einen JWT-Token zurück.
  - **Body (JSON):**
    ```json
    {
      "username": "philipp",
      "password": "17jbHaar$!"
    }
    ```
  - **Antwort:** Ein JSON-Objekt mit dem `token`.

### Administrative Endpunkte (Authentifizierung erforderlich)

Alle folgenden Endpunkte müssen mit dem `Authorization: Bearer <Token>`-Header aufgerufen werden.

- `GET /api/projects`: Ruft eine Liste aller Projekte ab.
- `POST /api/projects`: Erstellt ein neues Projekt. Akzeptiert alle Felder aus der `projects`-Tabelle im Body.
- `GET /api/projects/:id`: Ruft die Details eines spezifischen Projekts ab (inkl. der neuen Felder `about_cookies_text`, `custom_html` etc.).
- `PUT /api/projects/:id`: Aktualisiert ein bestehendes Projekt. Akzeptiert alle Felder aus der `projects`-Tabelle im Body.
- `DELETE /api/projects/:id`: Löscht ein spezifisches Projekt.

#### __Projekt-spezifische Unter-Routen__

- **Cookie-Management (`/api/projects/:projectId/cookies`)**
  - `GET /`: Ruft alle Cookie-Services für das Projekt ab.
  - `POST /`: Fügt einen neuen Cookie-Service zum Projekt hinzu.
    - **Body (JSON):**
      ```json
      {
          "name": "Google Analytics",
          "description": "Hilft uns zu verstehen, wie Besucher mit der Website interagieren.",
          "provider": "Google LLC",
          "cookie_names": "_ga, _gid",
          "script_code": "<script>...</script>",
          "privacy_policy_url": "https://policies.google.com/privacy",
          "retention_period": "2 Jahre",
          "purpose": "Analyse",
          "category_id": 1
      }
      ```
  - `PUT /:cookieId`: Aktualisiert einen spezifischen Cookie-Service.
  - `DELETE /:cookieId`: Löscht einen spezifischen Cookie-Service.

- **Statistiken & Logs (`/api/projects/:projectId`)**
  - `GET /consent-logs`: Ruft die Zustimmungsprotokolle für das Projekt ab.
  - `GET /analytics`: Ruft aggregierte Statistiken für das Projekt ab.

## 4. Datenbank-Schema

Die Datenbank besteht aus den folgenden Haupttabellen:

- **`users`**: Speichert die administrativen Benutzer.
  - `id`, `username`, `password`, `created_at`
- **`projects`**: Enthält die Konfiguration für jedes DSGVO-Banner-Projekt.
  - `id`, `name`, `domain`, `banner_title`, `banner_text`, `language`, `expiry_months`, `active`, etc.
- **`cookie_categories`**: Definiert die Cookie-Kategorien für jedes Projekt.
  - `id`, `project_id`, `name`, `description`, `required`, `sort_order`
- **`cookie_services`**: Definiert die einzelnen Dienste oder Skripte innerhalb einer Kategorie.
  - `id`, `project_id`, `category_id`, `name`, `script_code`
- **`consent_logs`**: Protokolliert jede erteilte Zustimmung.
  - `id`, `project_id`, `consents` (JSON), `ip_pseudonymized`, `expires_at`, `created_at`

## 5. Beispiel-Workflow in einer React-Anwendung (mit `axios`)

```javascript
import axios from 'axios';

const API_URL = 'https://dsgvobanner.plan-p.com/api';

// 1. Login und Token speichern
const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    const token = response.data.token;
    localStorage.setItem('jwt_token', token); // Token im Local Storage speichern
    return token;
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// 2. Geschützte Daten abrufen
const getProjects = async () => {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No token found!');
    }

    const response = await axios.get(`${API_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Projects:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
};

// Beispiel-Aufruf
async function main() {
  await login('philipp', '17jbHaar$!');
  await getProjects();
}

main();
