from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="*")


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "NodePlanner API"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
