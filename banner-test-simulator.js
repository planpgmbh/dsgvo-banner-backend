/**
 * DSGVO Banner Test Simulator
 * Simuliert alle möglichen User-Interaktionen mit dem Cookie-Banner
 */

const fs = require('fs');
const path = require('path');

// Test-Szenarien definieren
const testScenarios = {
    scenario1: {
        name: "Erstbesucher - Banner erscheint",
        description: "Simuliert ersten Seitenbesuch ohne vorherige Cookies",
        setup: () => clearAllStorage(),
        expectedBehavior: "Banner sollte sofort sichtbar sein"
    },
    scenario2: {
        name: "Alle akzeptieren - Vollzustimmung",
        description: "User klickt 'Alle akzeptieren'",
        action: () => simulateButtonClick('acceptAll'),
        expectedResult: {
            banner: "versteckt",
            cookies: "alle Kategorien akzeptiert",
            localStorage: "vollständige Zustimmung gespeichert"
        }
    },
    scenario3: {
        name: "Nur notwendige - Minimal-Zustimmung",
        description: "User klickt 'Nur notwendige Cookies'", 
        action: () => simulateButtonClick('necessaryOnly'),
        expectedResult: {
            banner: "versteckt",
            cookies: "nur notwendige Kategorien",
            localStorage: "minimale Zustimmung gespeichert"
        }
    },
    scenario4a: {
        name: "Auswahl speichern - Alle Checkboxen aktiviert",
        description: "User aktiviert alle Checkboxen und klickt 'Auswahl speichern'",
        setup: () => setAllCheckboxes(true),
        action: () => simulateButtonClick('acceptSelection'),
        expectedResult: "wie 'Alle akzeptieren'"
    },
    scenario4b: {
        name: "Auswahl speichern - Nur Statistiken",
        description: "User aktiviert nur Statistik-Checkbox",
        setup: () => setCheckboxes({pref: false, stat: true, mkt: false}),
        action: () => simulateButtonClick('acceptSelection'),
        expectedResult: "nur Statistik-Cookies akzeptiert"
    },
    scenario4c: {
        name: "Auswahl speichern - Nur Marketing",
        description: "User aktiviert nur Marketing-Checkbox",
        setup: () => setCheckboxes({pref: false, stat: false, mkt: true}),
        action: () => simulateButtonClick('acceptSelection'),
        expectedResult: "nur Marketing-Cookies akzeptiert"
    },
    scenario4d: {
        name: "Auswahl speichern - Präferenzen + Statistiken",
        description: "User aktiviert Präferenz- und Statistik-Checkboxen",
        setup: () => setCheckboxes({pref: true, stat: true, mkt: false}),
        action: () => simulateButtonClick('acceptSelection'),
        expectedResult: "Präferenz- und Statistik-Cookies akzeptiert"
    },
    scenario5: {
        name: "Wiederkehrender User mit gültigen Cookies",
        description: "Simuliert Seitenbesuch mit existierendem Cookie",
        setup: () => setCookie('dsgvo_consent=true; expires=' + futureDate()),
        expectedResult: "Banner sollte NICHT erscheinen"
    },
    scenario6: {
        name: "Wiederkehrender User mit abgelaufenen Cookies", 
        description: "Simuliert Seitenbesuch mit abgelaufenem Cookie",
        setup: () => setCookie('dsgvo_consent=true; expires=' + pastDate()),
        expectedResult: "Banner sollte wieder erscheinen"
    },
    scenario7: {
        name: "LocalStorage Konsistenz-Test",
        description: "Prüft ob LocalStorage und Cookies synchron sind",
        tests: [
            () => testStorageConsistency('acceptAll'),
            () => testStorageConsistency('necessaryOnly'),
            () => testStorageConsistency('acceptSelection')
        ]
    }
};

// Test-Hilfsfunktionen
function clearAllStorage() {
    return `
    // Alle Cookies und LocalStorage löschen
    document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage komplett geleert');
    `;
}

function simulateButtonClick(action) {
    return `
    // Button-Klick simulieren: ${action}
    const button = document.querySelector('[data-action="${action}"]');
    if (button) {
        console.log('🖱️ Klicke Button: ${action}');
        button.click();
        return true;
    } else {
        console.error('❌ Button nicht gefunden: ${action}');
        return false;
    }
    `;
}

function setCheckboxes(states) {
    return `
    // Checkboxen setzen: ${JSON.stringify(states)}
    const checkboxes = {
        pref: document.getElementById('uc-pref'),
        stat: document.getElementById('uc-stat'), 
        mkt: document.getElementById('uc-mkt')
    };
    
    Object.keys(checkboxes).forEach(key => {
        if (checkboxes[key]) {
            checkboxes[key].checked = ${JSON.stringify(states)}[key];
            console.log('☑️ Checkbox ' + key + ': ' + checkboxes[key].checked);
        }
    });
    `;
}

function setAllCheckboxes(checked) {
    return setCheckboxes({pref: checked, stat: checked, mkt: checked});
}

function setCookie(cookieString) {
    return `document.cookie = '${cookieString}'; console.log('🍪 Cookie gesetzt: ${cookieString}');`;
}

function futureDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toUTCString();
}

function pastDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toUTCString();
}

function testStorageConsistency(action) {
    return `
    // Storage-Konsistenz testen für: ${action}
    console.log('🔍 Teste Storage-Konsistenz für: ${action}');
    
    // Vor Aktion
    const beforeCookie = document.cookie.includes('dsgvo_consent=true');
    const beforeStorage = localStorage.getItem('dsgvo_consent_details');
    
    // Aktion ausführen
    ${simulateButtonClick(action)}
    
    // Nach Aktion (mit Delay)
    setTimeout(() => {
        const afterCookie = document.cookie.includes('dsgvo_consent=true');
        const afterStorage = localStorage.getItem('dsgvo_consent_details');
        
        console.log('📊 Konsistenz-Check:');
        console.log('  Cookie vorher:', beforeCookie, '→ nachher:', afterCookie);
        console.log('  LocalStorage vorher:', !!beforeStorage, '→ nachher:', !!afterStorage);
        
        if (afterCookie && afterStorage) {
            const storageData = JSON.parse(afterStorage);
            console.log('  ✅ Beide gesetzt - Details:', storageData);
        } else {
            console.log('  ❌ Inkonsistenz detektiert!');
        }
    }, 1000);
    `;
}

// Generiere HTML-Test-Seite mit allen Szenarien
function generateTestPage() {
    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Umfassender Banner-Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .test-container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .scenario { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .scenario h3 { margin: 0 0 10px 0; color: #333; }
        .scenario p { margin: 5px 0; color: #666; }
        .test-btn { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 5px; }
        .test-btn:hover { background: #0056b3; }
        .reset-btn { background: #dc3545; }
        .reset-btn:hover { background: #c82333; }
        .results { background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0; min-height: 100px; overflow-y: auto; font-family: monospace; font-size: 12px; }
        .banner-status { position: fixed; top: 10px; right: 10px; background: #28a745; color: white; padding: 10px; border-radius: 5px; font-weight: bold; }
        .banner-status.hidden { background: #dc3545; }
    </style>
</head>
<body>
    <div class="banner-status" id="banner-status">Banner-Status: Laden...</div>
    
    <div class="test-container">
        <h1>🧪 Umfassender DSGVO Banner Test</h1>
        <p>Diese Seite testet alle möglichen Cookie-Banner-Szenarien systematisch.</p>
        
        <div class="scenario">
            <h3>🔄 Test-Kontrollen</h3>
            <button class="test-btn reset-btn" onclick="resetAll()">🗑️ Alles zurücksetzen</button>
            <button class="test-btn" onclick="checkBannerStatus()">🔍 Banner-Status prüfen</button>
            <button class="test-btn" onclick="showStorageInfo()">📊 Storage-Info anzeigen</button>
        </div>

        ${generateScenarioHTML()}

        <div class="scenario">
            <h3>📋 Test-Ergebnisse</h3>
            <div id="results" class="results">Test-Ergebnisse werden hier angezeigt...</div>
        </div>
    </div>

    <!-- Banner-Script -->
    <script src="http://localhost:5173/load.js?id=24"></script>

    <!-- Test-JavaScript -->
    <script>
        ${generateTestJavaScript()}
    </script>
</body>
</html>
    `;
}

function generateScenarioHTML() {
    return Object.entries(testScenarios).map(([key, scenario]) => `
        <div class="scenario">
            <h3>📋 ${scenario.name}</h3>
            <p>${scenario.description}</p>
            <button class="test-btn" onclick="runScenario('${key}')">▶️ Test ausführen</button>
            ${scenario.expectedResult ? `<p><strong>Erwartet:</strong> ${typeof scenario.expectedResult === 'string' ? scenario.expectedResult : JSON.stringify(scenario.expectedResult)}</p>` : ''}
        </div>
    `).join('');
}

function generateTestJavaScript() {
    return `
        let testResults = [];

        function log(message, type = 'info') {
            const results = document.getElementById('results');
            const timestamp = new Date().toLocaleTimeString();
            const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
            results.innerHTML += \`[\${timestamp}] \${icon} \${message}<br>\`;
            results.scrollTop = results.scrollHeight;
            console.log(message);
        }

        function resetAll() {
            ${clearAllStorage()}
            log('🔄 Vollständiger Reset durchgeführt', 'success');
            location.reload();
        }

        function checkBannerStatus() {
            const banner = document.getElementById('dsgvo-banner-container');
            const statusDiv = document.getElementById('banner-status');
            
            if (banner && banner.style.display !== 'none') {
                statusDiv.textContent = 'Banner-Status: Sichtbar';
                statusDiv.className = 'banner-status';
                log('🔍 Banner ist SICHTBAR');
            } else {
                statusDiv.textContent = 'Banner-Status: Versteckt';
                statusDiv.className = 'banner-status hidden';
                log('🔍 Banner ist VERSTECKT');
            }
        }

        function showStorageInfo() {
            const cookies = document.cookie;
            const localStorage = window.localStorage.getItem('dsgvo_consent_details');
            
            log('📊 === Storage-Info ===');
            log('🍪 Cookies: ' + (cookies || 'Keine'));
            log('💾 LocalStorage: ' + (localStorage || 'Leer'));
            
            if (localStorage) {
                try {
                    const data = JSON.parse(localStorage);
                    log('📋 Consent-Details: ' + JSON.stringify(data, null, 2));
                } catch(e) {
                    log('❌ LocalStorage-Parsing-Fehler: ' + e.message, 'error');
                }
            }
        }

        // Szenario-Runner
        function runScenario(scenarioKey) {
            log(\`🚀 === Starte Szenario: \${scenarioKey} ===\`);
            
            const scenario = ${JSON.stringify(testScenarios, null, 2)}[scenarioKey];
            if (!scenario) {
                log('❌ Szenario nicht gefunden: ' + scenarioKey, 'error');
                return;
            }

            // Setup ausführen (falls vorhanden)
            if (scenario.setup) {
                log('⚙️ Setup wird ausgeführt...');
                // Setup-Code hier ausführen
            }

            // Spezielle Behandlung für verschiedene Szenarien
            switch(scenarioKey) {
                case 'scenario1':
                    testScenario1();
                    break;
                case 'scenario2':
                    testScenario2();
                    break;
                case 'scenario3':
                    testScenario3();
                    break;
                case 'scenario4a':
                case 'scenario4b':
                case 'scenario4c':
                case 'scenario4d':
                    testScenario4(scenarioKey);
                    break;
                case 'scenario5':
                    testScenario5();
                    break;
                case 'scenario6':
                    testScenario6();
                    break;
                case 'scenario7':
                    testScenario7();
                    break;
            }

            setTimeout(checkBannerStatus, 1000);
        }

        // Spezifische Szenario-Tests
        function testScenario1() {
            ${clearAllStorage()}
            setTimeout(() => {
                checkBannerStatus();
                log('✅ Szenario 1 abgeschlossen - Banner sollte sichtbar sein', 'success');
            }, 1000);
        }

        function testScenario2() {
            log('🖱️ Simuliere Klick: Alle akzeptieren');
            const button = document.querySelector('[data-action="acceptAll"]');
            if (button) {
                button.click();
                setTimeout(() => {
                    showStorageInfo();
                    log('✅ Szenario 2 abgeschlossen', 'success');
                }, 1000);
            } else {
                log('❌ Button "Alle akzeptieren" nicht gefunden', 'error');
            }
        }

        function testScenario3() {
            log('🖱️ Simuliere Klick: Nur notwendige');
            const button = document.querySelector('[data-action="necessaryOnly"]');
            if (button) {
                button.click();
                setTimeout(() => {
                    showStorageInfo();
                    log('✅ Szenario 3 abgeschlossen', 'success');
                }, 1000);
            } else {
                log('❌ Button "Nur notwendige" nicht gefunden', 'error');
            }
        }

        function testScenario4(scenarioKey) {
            // Erst Checkboxen setzen
            const checkboxes = {
                pref: document.getElementById('uc-pref'),
                stat: document.getElementById('uc-stat'),
                mkt: document.getElementById('uc-mkt')
            };

            // Checkbox-Kombinationen je nach Szenario
            let states = {};
            switch(scenarioKey) {
                case 'scenario4a':
                    states = {pref: true, stat: true, mkt: true};
                    break;
                case 'scenario4b':
                    states = {pref: false, stat: true, mkt: false};
                    break;
                case 'scenario4c':
                    states = {pref: false, stat: false, mkt: true};
                    break;
                case 'scenario4d':
                    states = {pref: true, stat: true, mkt: false};
                    break;
            }

            log('☑️ Setze Checkboxen: ' + JSON.stringify(states));
            Object.keys(states).forEach(key => {
                if (checkboxes[key]) {
                    checkboxes[key].checked = states[key];
                }
            });

            // Dann "Auswahl speichern" klicken
            setTimeout(() => {
                const button = document.querySelector('[data-action="acceptSelection"]');
                if (button) {
                    button.click();
                    setTimeout(() => {
                        showStorageInfo();
                        log('✅ Szenario ' + scenarioKey + ' abgeschlossen', 'success');
                    }, 1000);
                } else {
                    log('❌ Button "Auswahl speichern" nicht gefunden', 'error');
                }
            }, 500);
        }

        function testScenario5() {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            document.cookie = 'dsgvo_consent=true; expires=' + futureDate.toUTCString() + '; path=/';
            log('🍪 Gültigen Cookie gesetzt - Banner sollte versteckt bleiben');
            setTimeout(() => {
                checkBannerStatus();
                log('✅ Szenario 5 abgeschlossen', 'success');
            }, 1000);
        }

        function testScenario6() {
            const pastDate = new Date();
            pastDate.setFullYear(pastDate.getFullYear() - 1);
            document.cookie = 'dsgvo_consent=true; expires=' + pastDate.toUTCString() + '; path=/';
            log('🍪 Abgelaufenen Cookie gesetzt - Banner sollte wieder erscheinen');
            location.reload(); // Seite neu laden um Effekt zu sehen
        }

        function testScenario7() {
            log('🔍 Teste Storage-Konsistenz...');
            
            const actions = ['acceptAll', 'necessaryOnly', 'acceptSelection'];
            let actionIndex = 0;
            
            function testNextAction() {
                if (actionIndex >= actions.length) {
                    log('✅ Szenario 7 abgeschlossen - Konsistenz-Tests durchgeführt', 'success');
                    return;
                }
                
                const action = actions[actionIndex];
                log(\`🧪 Teste Konsistenz für: \${action}\`);
                
                // Reset für sauberen Test
                ${clearAllStorage()}
                
                setTimeout(() => {
                    ${testStorageConsistency(action)}
                    actionIndex++;
                    setTimeout(testNextAction, 3000); // Warten zwischen Tests
                }, 1000);
            }
            
            testNextAction();
        }

        // Auto-Status-Check alle 5 Sekunden
        setInterval(checkBannerStatus, 5000);

        // Initial-Status nach 2 Sekunden
        setTimeout(() => {
            checkBannerStatus();
            log('🎯 Test-Seite geladen und bereit!', 'success');
        }, 2000);
    `;
}

// Hauptfunktion
console.log('🧪 Generiere umfassende Banner-Test-Seite...');
const testPageContent = generateTestPage();

console.log('Test-Szenarien:');
Object.entries(testScenarios).forEach(([key, scenario]) => {
    console.log(\`  \${key}: \${scenario.name}\`);
});

// Speichere Test-Seite
const outputPath = '/Users/schuberth/docker/projects/dsgvo-banner-backend/banner-test-complete.html';
require('fs').writeFileSync(outputPath, testPageContent);
console.log(\`✅ Test-Seite generiert: \${outputPath}\`);

module.exports = { testScenarios, generateTestPage };