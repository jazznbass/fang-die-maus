#!/bin/zsh
cd -- "$(dirname -- "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js wird benötigt. Die Anleitung steht in README.md."
  read "?Zum Schließen die Eingabetaste drücken."
  exit 1
fi
node scripts/serve.js
