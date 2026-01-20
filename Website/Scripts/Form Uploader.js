const form = document.getElementById("form-number-plate");
const input_field = document.getElementById("form-number-plate-input");

/**
 * Called when user submits a number plate in the manual string entry.
 * Sends the plate to create_api_request_entry() defined in API Request Generator.js
 */
form.addEventListener("submit", async (event) => {
    try {
        event.preventDefault();

        plate = input_field.value;

        create_api_request_entry(plate);
    } catch (error) {
        console.error(error);
        output.textContent = "Failed to load data.";
    }
});
