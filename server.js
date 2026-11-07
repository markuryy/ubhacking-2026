const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static("public"));

function makeCode() {
    // use only these letters to generate codes with
    // I and O are kept out since they look like numbers sometimes
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";

    // generate a 4-character code
    let code = "";
    for (let i = 0; i < 4; i++){
        // each iteration, add one new random character from our defined letters to the code string
        code = code + letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
}

app.post("/api/create", function (req, res) {
  let code = makeCode();
  
  console.log("Created party", code);
  res.json({ code: code });
});

app.listen(3000, function () {
  console.log("Server running on port 3000");
});