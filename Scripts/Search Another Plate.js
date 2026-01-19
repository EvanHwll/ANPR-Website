/**
 * Called when user clicks search again after making a search.
 * Resets the screen by hiding necessary elements and revealing others.
 * Does not reveal webcam again if show_video is false.
 */
btn_search_again.addEventListener("click", () => {
    btn_search_again.style.display = "none";

    search_for_plate = true;
    if (show_video) {
        show_element(video);
    }
    video.play();

    input_field.value = "";
    document.getElementById("result").innerHTML = "Result";

    hide_element(plate_display);
    hide_element(mot_info_box);
    hide_element(tax_info_box);

    show_element(btn_toggle_video);

    mot_info_box.style.backgroundColor = "rgb(83, 83, 83)";
    mot_info_sub.innerHTML = "";

    tax_info_box.style.backgroundColor = "rgb(83, 83, 83)";
    tax_info_sub.innerHTML = "";
});
