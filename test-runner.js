/**
 * Systematischer DSGVO Banner Test Runner
 * Führt alle Test-Szenarien automatisch aus
 */

console.log('🧪 === DSGVO Banner Test Runner gestartet ===');

// Test-Szenarien definieren
const testResults = [];

// Utility-Funktionen
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${icon} ${message}`);
    testResults.push(`${timestamp}: ${message}`);
}

function clearAllStorage() {
    // Alle Cookies löschen
    document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // LocalStorage und SessionStorage löschen
    localStorage.clear();
    sessionStorage.clear();
    
    log('🗑️ Alle Cookies und Storage geleert');
}

function checkBannerStatus() {
    const banner = document.getElementById('dsgvo-banner-container');
    const isVisible = banner && banner.style.display !== 'none' && banner.offsetHeight > 0;
    log(`🔍 Banner-Status: ${isVisible ? 'SICHTBAR' : 'VERSTECKT'}`);
    return isVisible;
}

function showStorageInfo() {
    const cookies = document.cookie;
    const localStorage_data = localStorage.getItem('dsgvo_consent_details');
    
    log('📊 === Storage-Info ===');
    log(`🍪 Cookies: ${cookies || 'Keine'}`);
    log(`💾 LocalStorage: ${localStorage_data ? 'Gesetzt' : 'Leer'}`);
    
    if (localStorage_data) {
        try {
            const data = JSON.parse(localStorage_data);
            log(`📋 Consent-Details: ${JSON.stringify(data.accepted_categories)}`);
        } catch(e) {
            log(`❌ LocalStorage-Parsing-Fehler: ${e.message}`, 'error');
        }
    }
}

function simulateButtonClick(action) {
    const button = document.querySelector(`[data-action="${action}"]`);
    if (button) {
        log(`🖱️ Klicke Button: ${action}`);
        button.click();
        return true;
    } else {
        log(`❌ Button nicht gefunden: ${action}`, 'error');
        return false;
    }
}

function setCheckboxes(states) {
    log(`☑️ Setze Checkboxen: ${JSON.stringify(states)}`);
    
    const checkboxes = {
        pref: document.getElementById('uc-pref'),
        stat: document.getElementById('uc-stat'),
        mkt: document.getElementById('uc-mkt')
    };
    
    Object.keys(states).forEach(key => {
        if (checkboxes[key]) {
            checkboxes[key].checked = states[key];
            log(`  ${key}: ${states[key]}`);
        } else {
            log(`  ❌ Checkbox ${key} nicht gefunden`, 'warning');
        }
    });
}

// Test-Szenarien
async function runAllTests() {
    log('🚀 === Starte alle Test-Szenarien ===');
    
    try {
        // Szenario 1: Erstbesucher
        await testScenario1();
        await delay(2000);
        
        // Szenario 2: Alle akzeptieren
        await testScenario2();
        await delay(2000);
        
        // Szenario 3: Nur notwendige
        await testScenario3();
        await delay(2000);
        
        // Szenario 4A: Alle Checkboxen + Auswahl speichern
        await testScenario4A();
        await delay(2000);
        
        // Szenario 4B: Nur Statistiken + Auswahl speichern
        await testScenario4B();
        await delay(2000);
        
        // Szenario 4C: Nur Marketing + Auswahl speichern
        await testScenario4C();
        await delay(2000);
        
        // Szenario 5: Wiederkehrender User (gültige Cookies)
        await testScenario5();
        await delay(2000);
        
        // Szenario 6: Storage-Konsistenz-Test
        await testScenario6();
        
        log('🎉 === Alle Tests abgeschlossen ===', 'success');
        showTestSummary();
        
    } catch (error) {
        log(`❌ Fehler während der Tests: ${error.message}`, 'error');
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test-Implementierungen

async function testScenario1() {
    log('📋 === Szenario 1: Erstbesucher ===');
    clearAllStorage();
    
    // Seite neu laden um Banner-Initialisierung zu simulieren
    location.reload();
}

async function testScenario2() {
    log('📋 === Szenario 2: Alle akzeptieren ===');
    clearAllStorage();
    await delay(1000);
    
    const success = simulateButtonClick('acceptAll');
    if (success) {
        await delay(1000);
        const bannerHidden = !checkBannerStatus();
        showStorageInfo();
        log(`Ergebnis: Banner versteckt: ${bannerHidden}`, bannerHidden ? 'success' : 'error');
    }
}

async function testScenario3() {
    log('📋 === Szenario 3: Nur notwendige ===');
    clearAllStorage();
    await delay(1000);
    
    const success = simulateButtonClick('necessaryOnly');
    if (success) {
        await delay(1000);
        const bannerHidden = !checkBannerStatus();
        showStorageInfo();
        log(`Ergebnis: Banner versteckt: ${bannerHidden}`, bannerHidden ? 'success' : 'error');
    }
}

async function testScenario4A() {
    log('📋 === Szenario 4A: Alle Checkboxen + Auswahl speichern ===');
    clearAllStorage();
    await delay(1000);
    
    // Erst Details-Modal öffnen
    simulateButtonClick('showDetails');
    await delay(500);
    
    setCheckboxes({pref: true, stat: true, mkt: true});
    await delay(500);
    
    const success = simulateButtonClick('acceptSelection');
    if (success) {
        await delay(1000);
        showStorageInfo();
        log('Szenario 4A abgeschlossen', 'success');
    }
}

async function testScenario4B() {
    log('📋 === Szenario 4B: Nur Statistiken + Auswahl speichern ===');
    clearAllStorage();
    await delay(1000);
    
    simulateButtonClick('showDetails');
    await delay(500);
    
    setCheckboxes({pref: false, stat: true, mkt: false});
    await delay(500);
    
    const success = simulateButtonClick('acceptSelection');
    if (success) {
        await delay(1000);
        showStorageInfo();
        log('Szenario 4B abgeschlossen', 'success');
    }
}

async function testScenario4C() {
    log('📋 === Szenario 4C: Nur Marketing + Auswahl speichern ===');
    clearAllStorage();
    await delay(1000);
    
    simulateButtonClick('showDetails');
    await delay(500);
    
    setCheckboxes({pref: false, stat: false, mkt: true});
    await delay(500);
    
    const success = simulateButtonClick('acceptSelection');
    if (success) {
        await delay(1000);
        showStorageInfo();
        log('Szenario 4C abgeschlossen', 'success');
    }
}

async function testScenario5() {
    log('📋 === Szenario 5: Wiederkehrender User (gültige Cookies) ===');
    
    // Gültigen Cookie setzen
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    document.cookie = `dsgvo_consent=true; expires=${futureDate.toUTCString()}; path=/`;
    log('🍪 Gültigen Cookie gesetzt');
    
    // Seite neu laden
    log('🔄 Lade Seite neu um Cookie-Effekt zu testen...');
    setTimeout(() => location.reload(), 2000);
}

async function testScenario6() {
    log('📋 === Szenario 6: Storage-Konsistenz-Test ===');
    
    const actions = ['acceptAll', 'necessaryOnly'];
    
    for (const action of actions) {
        log(`🧪 Teste Konsistenz für: ${action}`);
        clearAllStorage();
        await delay(1000);
        
        const beforeCookie = document.cookie.includes('dsgvo_consent=true');
        const beforeStorage = !!localStorage.getItem('dsgvo_consent_details');
        
        simulateButtonClick(action);
        await delay(1000);
        
        const afterCookie = document.cookie.includes('dsgvo_consent=true');
        const afterStorage = !!localStorage.getItem('dsgvo_consent_details');
        
        log(`  Cookie: ${beforeCookie} → ${afterCookie}`);
        log(`  LocalStorage: ${beforeStorage} → ${afterStorage}`);
        
        if (afterCookie && afterStorage) {
            log(`  ✅ Konsistenz-Check OK für ${action}`, 'success');
        } else {
            log(`  ❌ Konsistenz-Problem bei ${action}`, 'error');
        }
    }
}

function showTestSummary() {
    log('📊 === Test-Zusammenfassung ===');
    const errors = testResults.filter(result => result.includes('❌'));
    const successes = testResults.filter(result => result.includes('✅'));
    
    log(`Gesamt-Tests: ${testResults.length}`);
    log(`Erfolgreich: ${successes.length}`, 'success');
    log(`Fehler: ${errors.length}`, errors.length > 0 ? 'error' : 'success');
    
    if (errors.length > 0) {
        log('🔍 Gefundene Probleme:');
        errors.forEach(error => console.log(error));
    }
}

// Starte Tests automatisch (optional)
// runAllTests();

console.log('📋 Test-Runner bereit. Führe runAllTests() aus um zu starten.');