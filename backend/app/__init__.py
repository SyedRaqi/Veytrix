from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
from app.api.engineering.routes import engineering_api
from app.config.settings import Settings


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(Settings)
    if test_config:
        app.config.update(test_config)

    app.config["MAX_CONTENT_LENGTH"] = 64 * 1024
    CORS(app, resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}})
    app.register_blueprint(engineering_api, url_prefix="/api/v1/engineering")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "veytrix-api"})

    @app.errorhandler(413)
    def payload_too_large(_error):
        return jsonify({"error": "Request payload is too large."}), 413

    return app
