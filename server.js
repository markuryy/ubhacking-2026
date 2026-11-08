const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// we are just going to store all the party data in memory
// it shouldn't be a problem unless the server restarts
const parties = {};

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

// Figure out if the caller is person A, person B, or nobody
function whoIs(party, token) {
  if (!token){
    return null;
  }
  if (token === party.tokenA) {
    return "A";
  }
  if (token === party.tokenB) {
    return "B";
  }
  return null;
}

app.post("/api/create", function (req, res) {
    let code = makeCode();
    const token = code + "A";

  parties[code] = {
    // we can make real tokens later if this becomes a problem
    tokenA: token,
    tokenB: null,
    readyA: false,
    readyB: false
  }
  
  console.log("Created party", code);
  res.json({
    code: code,
    token: token
  });
});

app.post("/api/join", function (req, res) {
    const code = req.body.code;
    const party = parties[code];

    if(!party){
        // party doesn't exist
        res.status(404).json({ error: "No party with that code" });
        return;
    }

    if(party.tokenB !== null){
        // party full
        res.status(400).json({ error: "Party is already full" });
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

app.post("/api/ready", function (req, res) {
  const code = req.body.code;
  const token = req.body.token;
  const ready = req.body.ready;
  const party = parties[code];

  if (!party) {
    res.status(404).json({ error: "No party with that code" });
    return;
  }

  const person = whoIs(party, token);

  if (person === "A") {
    party.readyA = ready;
  } else if (person === "B") {
    party.readyB = ready;
  } else {
    res.status(403).json({ error: "You are not in this party" });
    return;
  }

  console.log("Party", code, "person", person, "ready:", ready);
  res.json({ ok: true });
});

app.get("/api/status", function (req, res) {
  const code = req.query.code;
  const token = req.query.token;
  const party = parties[code];

  if(!party){
    res.status(404).json({
      error: "No party with that code"
    });
    return;
  }
    
  const person = whoIs(party, token);

  if (person === null) {
    res.status(403).json({
      error: "You are not in this party"
    });
    return;
  }

  // nobody has joined yet, so person A is still waiting for a friend
  if(party.tokenB === null) {
    res.json({
      status: "no-friend"
    });
    return;
  }

  // only say "both-ready" when BOTH flags are true
  // never send readyA or readyB themselves
  if(party.readyA === true && party.readyB === true) {
    res.json({
      status: "both-ready"
    });
    return;
  }

  // both players are waiting on agreement
  res.json({
    status: "waiting"
  });
})

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server running on port", port);
});