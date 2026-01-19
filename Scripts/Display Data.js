const output = document.getElementById("result");

const mot_info_box = document.getElementById("info-mot");
const mot_info_sub = document.getElementById("info-mot-sub");

const tax_info_box = document.getElementById("info-tax");
const tax_info_sub = document.getElementById("info-tax-sub");

const btn_search_again = document.getElementById("search-again");

const plate_display = document.getElementById("plate-display");

// Hide these elements by default.
hide_element(plate_display);
hide_element(btn_search_again);
hide_element(mot_info_box);
hide_element(tax_info_box);

/**
 * Displays the formatted JSON in the MOT and Tax boxes.
 *
 * Args:
 * data : The JSON to be used to fill in the boxes.
 */
function display_data(data) {
    search_for_plate = false;
    output.textContent = JSON.stringify(data, null, 2);

    show_element(btn_search_again);
    hide_element(btn_toggle_video);
    hide_element(video);

    // For MOT
    if (data.mot.valid == true) {
        mot_info_box.style.backgroundColor = "green";
        mot_info_sub.innerHTML = `Expires <b>${data.mot.due_date}</b> (in ${data.mot.days_until_due} days)`;
    }
    if (data.mot.valid == false) {
        mot_info_box.style.backgroundColor = "red";
        mot_info_sub.innerHTML = `Expired <b>${data.mot.due_date}</b> (${Math.abs(data.mot.days_until_due)} days ago) `;
    }
    if (data.mot.valid == "Unknown") {
        mot_info_box.style.backgroundColor = "grey";
        mot_info_sub.innerHTML = `There is no MOT Data for this vehicle held by the DVLA.`;
    }
    if (data.mot.valid == "AgeExempt") {
        mot_info_box.style.backgroundColor = "orange";
        mot_info_sub.innerHTML = `This vehicle is exempt from MOT due to being 40 years or older <b>unless it has been signficantly changed!</b>`;
    }
    if (data.mot.valid == "NewExempt") {
        mot_info_box.style.backgroundColor = "orange";
        mot_info_sub.innerHTML = `This vehicle is exempt from MOT due to being a new vehicle (less than 3 years)`;
    }

    // For tax
    if (data.tax.valid == true) {
        tax_info_box.style.backgroundColor = "green";
        tax_info_sub.innerHTML = `Expires <b>${data.tax.due_date}</b> (in ${data.tax.days_until_due} days)`;
    }
    if (data.tax.valid == false) {
        tax_info_box.style.backgroundColor = "red";
        tax_info_sub.innerHTML = `Expired <b>${data.tax.due_date}</b> (${Math.abs(data.tax.days_until_due)} days ago) `;
    }
    if (data.tax.valid == "Unknown") {
        tax_info_box.style.backgroundColor = "grey";
        tax_info_sub.innerHTML = `There is no Tax Data for this vehicle held by the DVLA.`;
    }
    if (data.tax.valid == "AgeExempt") {
        tax_info_box.style.backgroundColor = "orange";
        tax_info_sub.innerHTML = `This vehicle is exempt from Tax.`;
    }
    if (data.tax.valid == "SornExempt") {
        tax_info_box.style.backgroundColor = "orange";
        tax_info_sub.innerHTML = `This vehicle is exempt from Tax due to SORN`;
    }

    plate_display.innerHTML = data.plate;

    show_element(plate_display);
    show_element(mot_info_box);
    show_element(tax_info_box);
}
