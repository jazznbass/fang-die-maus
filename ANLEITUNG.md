# Mäuse fangen – Anleitung für die Testleitung

## Starten

1. Auf dem Mac `Start-SRT.command` öffnen. Unter Windows `Start-SRT.cmd` öffnen.
2. Im Browser die Adresse http://127.0.0.1:8000 öffnen.
3. „Kurzer Test“ oder „Ganzer Test“ wählen.
4. Den Code der Person eintragen. Keinen Namen eintragen.
5. Die Variante wählen und auf „Test vorbereiten“ klicken.

Das Programm braucht Node.js für den lokalen Server. Die Browser-Dateien sind
bereits im Ordner enthalten. Zum Spielen ist kein Internet nötig.

## Die Varianten

- **Variante 1** ist die implizite Bedingung. Die Anleitung verrät keine feste Reihenfolge.
- **Variante 2** ist die explizite Bedingung. Die Anleitung erklärt die feste Reihenfolge.

Die gespeicherten Bezeichnungen bleiben `implicit` und `explicit`. So bleiben
die Datendateien mit der bisherigen Auswertung kompatibel.

## Spielen

Die Person drückt Y, X, M oder Komma. Die Tasten gehören zu den vier farbigen
Löchern. Die Beschriftung gilt für eine deutsche Tastatur.

Zwischen den Runden sieht die Person die gefangenen und entkommenen Mäuse.
Eine beliebige neue Taste startet die nächste Runde. Die Taste zählt noch nicht
als Antwort auf die nächste Maus. Mit Esc kann das Spiel beendet werden.

Die Hinweise können bei Bedarf vorgelesen werden. Dabei sollte die Testleitung
den angezeigten Text verwenden und in Variante 1 keine Reihenfolge verraten.

## Ergebnisse speichern

Am Ende „Ergebnisse speichern · Für die Testleitung“ öffnen.
Beide Dateien speichern: CSV und JSON. Auch nach einem Abbruch können die
bisherigen Ergebnisse gespeichert werden.

Eine zusätzliche Kopie liegt im Browser. Sie kann unter „Frühere Ergebnisse
öffnen“ heruntergeladen werden. Diese Kopie ersetzt nicht die gespeicherten
Dateien. Sie ist an den Browser und die verwendete Adresse gebunden.

## Texte und Einstellungen ändern

Die Einstellungen stehen in `config/study.json` und `config/demo.json`.
Unter `instructions` stehen die deutschen Anweisungen. Der zusätzliche Hinweis
zur festen Reihenfolge steht unter `conditions.explicit.additionalInstruction`.

Eigene Dateien können über „Eigene Datei laden …“ geöffnet werden. Die Namen
der Einstellungen im Programm bleiben Englisch. Angezeigte Texte sind Deutsch.

Die Oberfläche ist in einfacher Sprache formuliert. Eine Prüfung nach festen
Regeln für „Leichte Sprache“ wurde nicht durchgeführt.

Vor der Datenerhebung müssen die endgültigen Einstellungen und die Zeitmessung
auf den tatsächlich verwendeten Geräten geprüft werden.

## Hinweis zur Fingerposition

Wird während einer Maus eine andere als die vier farbigen Tasten gedrückt,
erscheint ein großer Hinweis. Die Finger richtig hinlegen und eine Taste drücken.
Dann erscheint dieselbe Maus erneut. Erst der nächste Tastendruck beantwortet sie.
Der Versuch wird in den Daten mit `valid_resoponse = 0` gekennzeichnet.

Nach „Los geht’s“ erscheint zunächst die Aufforderung, die Finger auf die
farbigen Tasten zu legen. Erst ein Tastendruck startet die erste Maus.
