import os


class Settings:
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    JSON_SORT_KEYS = False
