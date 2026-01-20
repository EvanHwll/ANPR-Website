const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const overlay = document.getElementById("overlay");
const btn_toggle_video = document.getElementById("toggle-video");

let search_for_plate = true;
let show_video = true;

// Start camera (full video, no resizing)
navigator.mediaDevices
    .getUserMedia({ video: { facingMode: { ideal: "environment" } } })
    .then((stream) => {
        video.srcObject = stream;
        video.play();
    })
    .catch((err) => console.error("Error accessing webcam:", err));

/**
 * positionOverlay()
 *
 * Centers the overlay rectangle on top of the video.
 * This rectangle indicates the area to capture for the API.
 */
function positionOverlay() {
    const rectWidth = 300; // width of capture rectangle
    const rectHeight = 100; // height of capture rectangle

    // Ensure video has loaded dimensions
    const videoWidth = video.clientWidth;
    const videoHeight = video.clientHeight;

    // Center rectangle horizontally and vertically
    overlay.style.width = rectWidth + "px";
    overlay.style.height = rectHeight + "px";
    overlay.style.left = (videoWidth - rectWidth) / 2 + "px";
    overlay.style.top = (videoHeight - rectHeight) / 2 + "px";
}

// Call initially and whenever the window resizes
positionOverlay();
window.addEventListener("resize", positionOverlay);

// Optional: reposition overlay when video metadata loads (mobile fix)
video.addEventListener("loadedmetadata", positionOverlay);

// Canvas size matches rectangle size
canvas.width = 300;
canvas.height = 100;

/**
 * capture_frame()
 *
 * Captures only the area inside the overlay rectangle from the full video
 * and sends it to the API as a Base64 string.
 */
function capture_frame() {
    if (!search_for_plate || document.hidden || !show_video) return;

    const ctx = canvas.getContext("2d");

    // Get overlay rectangle position in screen coordinates
    const rect = overlay.getBoundingClientRect();
    const videoRect = video.getBoundingClientRect();

    // Map overlay rectangle to the video’s intrinsic resolution
    const scaleX = video.videoWidth / videoRect.width;
    const scaleY = video.videoHeight / videoRect.height;

    // Add margin around the rectangle (in pixels, screen coordinates)
    const margin = 20; // adjust as needed
    const sx = (rect.left - videoRect.left - margin) * scaleX;
    const sy = (rect.top - videoRect.top - margin) * scaleY;
    const sw = (rect.width + 2 * margin) * scaleX;
    const sh = (rect.height + 2 * margin) * scaleY;

    // Ensure we don't go outside video bounds
    const sxClamped = Math.max(0, sx);
    const syClamped = Math.max(0, sy);
    const swClamped = Math.min(video.videoWidth - sxClamped, sw);
    const shClamped = Math.min(video.videoHeight - syClamped, sh);

    // Draw the slightly bigger rectangle onto the canvas
    ctx.drawImage(
        video,
        sxClamped,
        syClamped,
        swClamped,
        shClamped,
        0,
        0,
        canvas.width,
        canvas.height,
    );

    // Convert canvas to Base64 and send to API
    const base64Image = canvas.toDataURL("image/png");
    create_api_request_image(base64Image);
}

// Capture a frame every second
setInterval(capture_frame, 1000);

/**
 * Toggle video visibility
 *
 * Shows or hides the video feed and overlay rectangle
 * when the toggle button is clicked.
 */
btn_toggle_video.addEventListener("click", () => {
    show_video = !show_video;
    video.style.display = show_video ? "block" : "none";
    overlay.style.display = show_video ? "block" : "none";
});
