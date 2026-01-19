from flask import Flask, jsonify, request
import threading
import easyocr
import os

app = Flask(__name__)

# Lazy load EasyOCR in background
reader = None
def init_reader():
    global reader
    reader = easyocr.Reader(['en'], verbose=False)
    print("EasyOCR loaded.")

threading.Thread(target=init_reader, daemon=True).start()

API_KEY = os.environ.get("VEHICLE_DATA_API_KEY")
if not API_KEY:
    raise ValueError("VEHICLE_DATA_API_KEY not set in environment")

# Simple health check
@app.route("/alive")
def alive():
    return {"status": "ok"}

# Example /entry
@app.route("/entry", methods=["GET"])
def entry():
    plate = request.args.get("plate")
    return {"plate": plate or "none"}

# Only used for local testing
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
