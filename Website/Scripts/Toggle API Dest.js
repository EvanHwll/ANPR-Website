btn_toggle_api_local = document.getElementById("toggle-api-local");
btn_toggle_api_dep = document.getElementById("toggle-api-dep");
txt_toggle_api = document.getElementById("toggle-api-text");

api_dest = "dep";

btn_toggle_api_local.addEventListener("click", () => {
    api_dest = "local";

    txt_toggle_api.innerHTML = `Currently Selected: ${api_dest}`;
});

btn_toggle_api_dep.addEventListener("click", () => {
    api_dest = "dep";

    txt_toggle_api.innerHTML = `Currently Selected: ${api_dest}`;
});
