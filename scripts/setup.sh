#!/usr/bin/env sh
set -eu
npm --prefix frontend install
python -m venv backend/.venv
printf 'Activate backend/.venv, then run: pip install -r backend/requirements.txt\n'
