let code = localStorage.getItem("code");

const startScreen = document.getElementById("startScreen");
const waitingScreen = document.getElementById("waitingScreen");
const partyScreen = document.getElementById("partyScreen");
const LGHScreen = document.getElementById("LGHScreen");

const createButton = document.getElementById("createButton");
const joinButton = document.getElementById("joinButton");
const leaveButton = document.getElementById("leaveButton");
const codeText = document.getElementById("codeText");

function showWaitingScreen(){
    // show the waiting screen and hide the current start screen
    startScreen.style.display = "none";
    waitingScreen.style.display = "block";
    codeText.textContent = localStorage.getItem("code");
}

function showPartyScreen(){
    // show the party screen and hide the current waiting screen
    waitingScreen.style.display = "none";
    partyScreen.style.display = "block";
    codeText.textContent = localStorage.getItem("code");
}

function showLGHScreen(){
    // show the "let's go home" screen and hide the current party screen
    partyScreen.style.display = "none";
    LGHScreen.style.display = "block";
}


function saveParty(data){
    code = data.code;
    token = data.token;
    // save the code to local storage so it survives refresh
    localStorage.setItem("code", code);
    showPartyScreen();
}

createButton.addEventListener("click", async function () {
  const response = await fetch("/api/create", { method: "POST" });
  const data = await response.json();
  console.log("Created party:", data);
  saveParty(data);
});

leaveButton.addEventListener("click", function () {
    localStorage.removeItem("code");
    location.reload();
})

if(localStorage.getItem("code") || code){
    showPartyScreen();
}

joinButton.addEventListener("click", async function () {
  const typedCode = codeInput.value.trim().toUpperCase();

  const response = await fetch("/api/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: typedCode })
  });
  const data = await response.json();
  console.log("Join response:", data);

  saveParty(data);
});

