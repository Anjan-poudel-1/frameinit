const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "quote.txt");
const outputDir = path.join("src", "app");
fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }

    // Split the contents of the file by line breaks
    const lines = data.split(/\r?\n/);

    // Create an array with the lines as strings
    const quotesArray = lines.filter((line) => line.trim() !== "");

    // Convert the array into a string representation
    const quotesExport = `module.exports = ${JSON.stringify(
        quotesArray,
        null,
        4
    )};`;

    // Write the array to quote.js
    fs.writeFile(
        path.join(outputDir, "quote.js"),
        quotesExport,
        { flag: "w" },
        (err) => {
            if (err) {
                console.error("Error writing file:", err);
                return;
            }
            console.log("Quotes array has been saved to quote.js");
        }
    );
});
