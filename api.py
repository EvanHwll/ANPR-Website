# api.py
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route("/alive")
def alive():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
