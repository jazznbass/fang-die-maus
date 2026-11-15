# Ideen und offene Aufgaben

Hier sammeln wir geplante Erweiterungen. Getroffene Entscheidungen stehen in
[DECISIONS.md](DECISIONS.md). Ein Eintrag hier bedeutet noch nicht, dass die
Funktion umgesetzt oder geprüft ist.

## Randlose App mit integriertem Browser

Aufgenommen: 15.11.2026 · Status: geplant, noch nicht umgesetzt

**Ziel:** Das Experiment per Doppelklick als eigene App starten. Während der
Aufgabe sollen keine Adressleiste, Tabs, Seitenleisten oder Fensterrahmen zu
sehen sein. Ein Browser und der lokale Server sollen nicht mehr von Hand
gestartet werden müssen.

**Angestrebte Lösung:** Electron als kleine Desktop-Hülle um das bestehende
JavaScript-/jsPsych-Programm. Electron bringt einen integrierten Chromium-Browser
mit. Die vorhandenen Klassen, Konfigurationsdateien und Grafiken sollen
weiterverwendet werden. Der Experimentcode bleibt unabhängig von der App-Hülle
und weiterhin im normalen Browser ausführbar.

- [ ] Electron-Hülle in eigenen, übersichtlichen Dateien ergänzen.
- [ ] Ein randloses Fenster (`frame: false`) einrichten; Vollbild bzw. Kioskmodus
      auf den Zielsystemen prüfen. Im Aufgabenbild dürfen keine Browserleisten
      oder Fensterbedienelemente sichtbar sein.
- [ ] Lokale Dateien über ein geeignetes App-Protokoll oder einen automatisch
      gestarteten lokalen Server bereitstellen. Konfiguration, Module und
      Grafiken müssen ohne Internetzugang geladen werden.
- [ ] Eine feste Tastenkombination zum Beenden für die Testleitung festlegen.
      Das bisherige Esc-Verhalten zum Abbrechen einer Sitzung berücksichtigen;
      vorhandene Ergebnisse müssen dabei erhalten bleiben.
- [ ] Dateiauswahl, CSV-/JSON-Export und Wiederherstellung von Ergebnissen in der
      App prüfen. Einen dauerhaften Speicherort und ein sauberes Beenden vorsehen.
- [ ] Electron-spezifische Rechte auf das Nötige begrenzen: kein Node.js-Zugriff
      aus dem Experimentfenster, isolierter Kontext, ausschließlich lokale Inhalte.
- [ ] Eine startbare App zunächst für macOS erstellen; anschließend Windows und
      bei Bedarf Linux berücksichtigen. Installation und Start dokumentieren.
- [ ] Fokuswechsel, Tasteneingaben, gehaltene Tasten, Vollbild und Abbruch testen.
- [ ] Reaktionszeitmessung und Darstellungsintervalle in der App auf den
      tatsächlichen Studiengeräten prüfen. Electron allein garantiert keine
      höhere zeitliche Genauigkeit.
- [ ] App-, Electron- und Chromium-Version in den Sitzungsdaten festhalten.

**Fertig, wenn:** Die App per Doppelklick offline startet, die Aufgabe ohne
Browserleisten darstellt, Ergebnisse zuverlässig speichert und sich kontrolliert
beenden lässt. Die Prüfungen und verbleibenden Grenzen sind dokumentiert.

Referenzen:
- [Electron: randlose Fenster](https://www.electronjs.org/docs/latest/tutorial/custom-window-styles)
- [Electron: BrowserWindow, Vollbild und Kioskmodus](https://www.electronjs.org/docs/latest/api/browser-window)
