const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const btn_toggle_video = document.getElementById("toggle-video");

// Default values.
search_for_plate = true;
show_video = false;

if (!show_video) {
    hide_element(video);
}

navigator.mediaDevices
    .getUserMedia({
        video: { facingMode: { ideal: "environment" } },
    })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((err) => {
        console.error("Error accessing webcam:", err);
    });

/**
 * capture_frame()
 *
 * Captures the current frame of the webcam, and converts it to a Base64 String.
 * Then sends it to create_api_request_image(base64Image) defined in API Request Generator.js
 */
async function capture_frame() {
    if (!search_for_plate) return;
    if (document.hidden) return;
    if (!show_video) return;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/png");
    create_api_request_image(base64Image);
}

setInterval(capture_frame, 1000);

btn_toggle_video.addEventListener("click", () => {
    show_video = !show_video;

    if (show_video) show_element(video);
    if (!show_video) hide_element(video);
});
