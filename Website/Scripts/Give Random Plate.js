const btn_random_plate = document.getElementById("get-random-plate");

async function getRandomLine(url) {
    const response = await fetch(url);
    const text = await response.text();

    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length === 0) {
        throw new Error("File is empty");
    }

    const randomIndex = Math.floor(Math.random() * lines.length);
    return lines[randomIndex];
}

btn_random_plate.addEventListener("click", async () => {
    try {
        const randomPlate = await getRandomLine("testdata.txt");
        document.getElementById("form-number-plate-input").value = randomPlate;
    } catch (err) {
        console.error(err);
        output.textContent = "Failed to load plates";
    }
});
