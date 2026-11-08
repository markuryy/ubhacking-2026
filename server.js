const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// we are just going to store all the party data in memory
// it shouldn't be a problem unless the server restarts
const parties = [];

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

  /*
  parties[code] = {
    // we can make real tokens later if this becomes a problem
    tokenA: req.body.code + "A",
    tokenB: null,
    statusA: false,
    statusB: false
  }
    */
  
  console.log("Created party", code);
  res.json({ code: code });

});
/*
app.post("/api/join", function (req, res) {
    const code = req.body.code;
    const party = parties[code];

    if(!party){
        // party doesn't exist
        return;
    }

    if(party.body.tokenB){
        // party full
        return;
    }

    const token = req.body.code + "B";
    party.tokenB = token;

    console.log("Someone joined party", code);
    res.json({
        code: code,
        token: token
    })
})
*/

app.listen(3000, function () {
  console.log("Server running on port 3000");
});