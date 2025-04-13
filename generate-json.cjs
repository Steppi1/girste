const fs = require("fs");

const folder = "./imgs";
const files = fs
  .readdirSync(folder)
  .filter(f => /\.(png|jpe?g|webp|gif|svg)$/i.test(f));

const output = files.map(f => `https://raw.githubusercontent.com/Steppi1/girste/main/imgs/${f}`);

fs.writeFileSync("images.json", JSON.stringify(output, null, 2));

console.log("✔️ images.json generato con", output.length, "immagini.");
