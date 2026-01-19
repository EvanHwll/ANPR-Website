/**
 * create_api_request_entry(plate)
 *
 * Creates an API Request to the Python api.py
 * This sends the plate via the plate parameter in the URL.
 *
 * Args:
 * plate : The plate to send to the API.
 */
async function create_api_request_entry(plate) {
    try {
        let response;

        if (api_dest == "local") {
            response = await fetch(
                `http://127.0.0.1:8080/entry?plate=${plate}`,
            );
        } else if (api_dest == "dep") {
            response = await fetch(
                `https://anpr-website-production.up.railway.app/entry?plate=${plate}`,
            );
        } else {
            output.innerHTML =
                "Failed to create API Request - invalid destination";
        }

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error == undefined) {
            hide_element(video);
            hide_element(btn_toggle_video);
            display_data(data);
        } else {
            output.innerHTML = data.error;
        }
    } catch (error) {
        console.error(error);
        output.innerHTML = `Failed to create API Request - ${error}`;
    }
}

/**
 * create_api_request_image(base64Image)
 *
 * Creates an API Request to the Python api.py
 * This sends the image via POST to the Python image processing.
 *
 * Args:
 * plate : The Base64 string of the image.
 */
async function create_api_request_image(base64Image) {
    try {
        let response;

        if (api_dest == "local") {
            response = await fetch("http://127.0.0.1:8080/anpr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image }),
            });
        } else if (api_dest == "dep") {
            response = await fetch(
                "https://anpr-website-production.up.railway.app/anpr",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64Image }),
                },
            );
        } else {
            output.innerHTML =
                "Failed to create API Request - invalid destination";
        }

        const data = await response.json();

        if (data.error == undefined) {
            video.pause();
            display_data(data);
        } else {
            output.innerHTML = data.error;
        }
    } catch (err) {
        console.error("Error sending image:", err);
    }
}
