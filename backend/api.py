from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import cv2
import numpy as np
import imutils
import easyocr
import string
import os
import base64
import threading

from dotenv import load_dotenv
load_dotenv()

from datetime import datetime, timezone


app = Flask(__name__)
CORS(app)

reader = None
def init_reader():
    global reader
    reader = easyocr.Reader(['en'], verbose=False)
    print("EasyOCR loaded.")
threading.Thread(target=init_reader, daemon=True).start()




API_KEY = os.environ.get("VEHICLE_DATA_API_KEY")
if not API_KEY:
    raise ValueError("VEHICLE_DATA_API_KEY not set!")





'''
Called when the user makes an API request to /entry.
Takes the plate parameter and sends it to make_api_request().
'''
@app.route("/entry", methods=["GET"])
def entry_plate():
    plate = request.args.get("plate")
    if not plate:
       return jsonify({"error": "Missing plate parameter"})

    return make_api_request(plate)


'''
Creates an API Request to the Data Provider to gather all necessary information.
Then creates a secondary JSON structure and copies required data across, abstracting all
irrelevant information to reduce size. Then returns it back to web client in JSON format.

Args:
plate : The plate to make the API request for.

Returns:
JSON : The abstracted JSON structure containing used information.
'''
def make_api_request(plate):

    url = "https://uk.api.vehicledataglobal.com/r2/lookup"

    params = {
        "packagename": "Main",
        "apikey": API_KEY,
        "vrm": plate
    }

    response = requests.get(url, params=params)

    if not response.ok:
        return {"error":"Sorry, I've reached my maximum daily requests. Try again tommorow!"}
    
    data = response.json()

    # If API request was not successful, return it early with error code.
    if data["ResponseInformation"]["IsSuccessStatusCode"] == False:
        return jsonify({"error":f"Could not find any data for {plate}"})


    # Copy required data into new JSON
    formatted_response = {
        "plate": data["Results"]["MotHistoryDetails"]["Vrm"],

        "mot": {
            "valid": "X" ,
            "due_date": "X",
            "days_until_due": "X"
        },

        "tax": {
            "valid": "X" ,
            "due_date": "X",
            "days_until_due": "X"
        }
    }

    # If there are no details currently stored, it may be a new vehicle.

    skip_mot_expiry = False

    days_since_reg = -calculate_days_until( data["Results"]["MotHistoryDetails"]["FirstUsedDate"] )
    if days_since_reg > 14600:
        formatted_response["mot"]["valid"] = "AgeExempt"
        skip_mot_expiry = True

    elif days_since_reg < 1095:
        formatted_response["mot"]["valid"] = "NewExempt"

    elif data["Results"]["VehicleTaxDetails"]["MotStatus"] == "Valid":
        formatted_response["mot"]["valid"] = True
    
    elif data["Results"]["VehicleTaxDetails"]["MotStatus"] == "Not valid":
        formatted_response["mot"]["valid"] = False

    else:
        formatted_response["mot"]["valid"] = "Unknown"
        skip_mot_expiry = True




    skip_tax_expiry = False

    days_since_reg = -calculate_days_until( data["Results"]["MotHistoryDetails"]["FirstUsedDate"] )
    if days_since_reg > 14600:
        formatted_response["tax"]["valid"] = "AgeExempt"
        skip_tax_expiry = True

    elif data["Results"]["VehicleTaxDetails"]["TaxStatus"] == "SORN":
        formatted_response["tax"]["valid"] = "SornExempt"
        skip_tax_expiry = True
    
    elif data["Results"]["VehicleTaxDetails"]["TaxStatus"] == "Taxed":
        formatted_response["tax"]["valid"] = True

    elif data["Results"]["VehicleTaxDetails"]["TaxStatus"] == "Untaxed":
        formatted_response["tax"]["valid"] = False

    else:
        formatted_response["tax"]["valid"] = "Unknown"
        skip_tax_expiry = True



    if not skip_mot_expiry:
        formatted_response["mot"]["due_date"], formatted_response["mot"]["days_until_due"] = calculate_expiry_info( data["Results"]["MotHistoryDetails"]["MotDueDate"])

    if not skip_tax_expiry:
        formatted_response["tax"]["due_date"], formatted_response["tax"]["days_until_due"] = calculate_expiry_info( data["Results"]["VehicleTaxDetails"]["TaxDueDate"])

    return jsonify(formatted_response)


'''
Called when the user makes an API request to /anpr.
Takes the base64 string via post.
'''
@app.route('/anpr', methods=['POST'])
def anpr():

    global reader
    if reader is None:
        return jsonify({"error": "OCR still loading, try again in a few seconds"})

    # Check image has been provided
    data = request.json
    if 'image' not in data:
        return jsonify({"error":f"[E03]"})
    
    image_data = data['image']


    # Generate real image then apply processing
    real_image = convert_base64_to_image(image_data)
    processed_image = apply_processing(real_image)


    # Detect text in image
    detected_text = add_contours(processed_image)


    # Return error if no text is found
    if detected_text == None:
        return jsonify({"error":f"No text found in image."})


    # Make API Request using the detected number plate
    return make_api_request(detected_text)



'''
Converts a given base64 image back into its original image.

Args:
image_data : The base64 string to convert

Returns:
img (cv2): The generated image.
'''
def convert_base64_to_image(image_data):
    # Remove the data URL prefix
    image_data = image_data.split(",")[1]

    # Convert to a numpy image, then decode it into CV2.
    np_img = np.frombuffer(base64.b64decode(image_data), np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    return img


'''
Applys processing effects to the image. Makes it black and white and reduces noise.

Args:
image : The cv2 image to process

Returns:
img (cv2): The updates cv2 image.
'''
def apply_processing(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) # Converts to black and white
    bfilter = cv2.bilateralFilter(gray, 11, 17, 17)  # Reduces noise

    return bfilter

'''
Adds contours around different key areas that could be a number plate. Then sorts
by size and checks each one for text.

Args:
image : The cv2 image to process

Returns:
str : The detected text if applicable, or "Nothing Found" otherwise.
'''
def add_contours(image):

    # Find the edges of contours
    edged = cv2.Canny(image, 30, 200)

    # Finds contours and then sorts them by their size, from smallest to largest.
    keypoints = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = imutils.grab_contours(keypoints)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
    
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        cropped_image = image[y:y + h, x:x + w]

        # Try to read text from the cropped image
        result = reader.readtext(cropped_image)

        # If there is a result, filter out the unnecessary details, remove all punctuation and spaces, then return it.
        if result:
            filtered = result[0][-2]
            filtered = filtered.translate(str.maketrans('', '', string.punctuation))
            filtered = filtered.replace(" ", "")

            if len(filtered) > 2:
                return filtered.upper()
    
    return None




'''
Converts the timestamps given by the API (YYYYmmddTHH:MM:SS[Z]) into a nicer timestamp (DD/MM/YY), and
also calculates the days until that timestamp.

Args:
default_str : The string returned by the API.

Returns:
str : The string containing the nicely formatted date.
int : The days until the given date.
'''
def calculate_expiry_info( default_str ):

    if default_str.endswith("Z"):
        due_date = datetime.strptime(default_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    else:
        due_date = datetime.strptime(default_str, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)

    days_until = calculate_days_until( default_str )

    return due_date.strftime("%d/%m/%Y"), days_until


def calculate_days_until( default_str ):
    if default_str.endswith("Z"):
        due_date = datetime.strptime(default_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    else:
        due_date = datetime.strptime(default_str, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)

    today = datetime.now(timezone.utc)
    delta = due_date - today

    return delta.days





if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)