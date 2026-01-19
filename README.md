# ANPR Website ![Python](https://img.shields.io/badge/python-3.13-blue) ![JavaScript](https://img.shields.io/badge/javascript-ES6-f7df1e)

This project uses a **Python Flask backend** to handle gathering the vehicle data, with a simple **HTML/CSS/JS Frontend** that allows users to input number plates and view information.

## Features

- Input numbers plates manually to get information about
- Live Camera Feed that automatically detects and reads number plates to get information about
- Backend fetches data from [VehicleData Global API](https://uk.api.vehicledataglobal.com/r2/lookup)  
- Filters and processes JSON responses to return only relevant data  
- Frontend dynamically updates to display formatted results.

## How It Works

### OCR

1. Every second a capture of the user's camera feed is taken.
2. This capture is converted into a Base64 string and sent via **POST API Request** to the Flask backend.
3. The backend rebuilds the photo, applies certain processing then applies an OCR Model to detect any possible number plate text. The picture is never stored anywhere.
5. If text is detected, the Flask backend sends a **GET API request** to VehicleData Global with the plate and package parameters.
6. The JSON response is processed to extract key information (eg MOT and tax status) and returned to the frontend.  
7. The frontend uses this data to update the page dynamically, improving efficiency by avoiding large JSON responses.

### Manual Entry

1. The user enters a number plate in the input field on screen.
2. The entered plate is sent via a **GET API request** to the Python Flask backend.
3. The Flask backend sends a **GET API request** to VehicleData Global with the plate and package parameters.
4. The JSON response is processed to extract key information (eg MOT and tax status) and returned to the frontend.  
5. The frontend uses this data to update the page dynamically, improving efficiency by avoiding large JSON responses.  

## Live Demo

The site is fully hosted and available here: [https://anpr.evanhowell.xyz](https://anpr.evanhowell.xyz)
> [!NOTE] 
> The free API Key used for testing has daily request limits. When the limit is reached, the site remains functional but vehicle data cannot be retrieved.

## Limitations

- Limited to **100 API requests per day** due to free testing API Key.  
- Only number plates containing the letter **A** can be queried because of API restrictions.  
- Some JSON fields such as `MotExempt` are not available in the free API, so age-based exemptions are estimated and may not always be accurate. Vehicles over 40 years old are automatically listed as MOT exempt, which may not be accurate if they have had significant modifications.

## Motivation

In 2024/2025, I created an initial ANPR website as part of my OCR A-Level Computer Science project. While functional, the original project had messy code, poor modularity, and lacked industry-standard practices, which made debugging and expansion difficult.  

In 2026, after completing a Software module at University, I learned professional coding techniques including:

- **Modular, reusable code**  
- **Self-documenting naming conventions**  
- **Unit testing and debugging best practices**  

I decided to **recreate my ANPR Website** to apply these skills in a familiar project and improve both its structure and functionality.
