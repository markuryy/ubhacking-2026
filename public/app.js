let code = localStorage.getItem("code");
let token = localStorage.getItem("token");

const startScreen = document.getElementById("startScreen");
const waitingScreen = document.getElementById("waitingScreen");
const partyScreen = document.getElementById("partyScreen");
const LGHScreen = document.getElementById("LGHScreen");

const createButton = document.getElementById("createButton");
const joinButton = document.getElementById("joinButton");
const leaveButton = document.getElementById("leaveButton");
const codeInput = document.getElementById("codeInput");
const codeText = document.getElementById("codeText");
const errorText = document.getElementById("errorText");

function hideAllScreens(){
    startScreen.style.display = "none";
    waitingScreen.style.display = "none";
    partyScreen.style.display = "none";
    LGHScreen.style.display = "none";
}

function showWaitingScreen(){
    // show the waiting screen and hide the current screen
    hideAllScreens();
    waitingScreen.style.display = "block";
    codeText.textContent = localStorage.getItem("code");
}

function showPartyScreen(){
    // show the party screen and hide the current screen
    hideAllScreens();
    partyScreen.style.display = "block";
}

function showLGHScreen(){
    // show the "let's go home" screen and hide the current screen
    hideAllScreens();
    LGHScreen.style.display = "block";
}

async function checkStatus(){
    // not in a party, so there is nothing to check
    if(!code || !token){
        return;
    }

    const url = "/api/status?code=" + code + "&token=" + token;
    const response = await fetch(url);
    const data = await response.json();
    console.log("Status:", data);

    // the party is gone (e.g. server restarted)
    // todo

    if (data.status === "no-friend") {
        showWaitingScreen();
    } else if (data.status === "waiting") {
        showPartyScreen();
    } else if (data.status === "both-ready") {
        showLGHScreen();
    }
}

function saveParty(data){
    code = data.code;
    token = data.token;
    // save the code to local storage so it survives refresh
    localStorage.setItem("code", code);
    localStorage.setItem("token", token);
}

createButton.addEventListener("click", async function () {
  const response = await fetch("/api/create", { method: "POST" });
  const data = await response.json();
  console.log("Created party:", data);
  saveParty(data);
  showWaitingScreen();
});

leaveButton.addEventListener("click", function () {
    localStorage.removeItem("code");
    localStorage.removeItem("token");
    location.reload();
})

// check once right away, then every 3 seconds
checkStatus();
setInterval(checkStatus, 3000);

joinButton.addEventListener("click", async function () {
  const typedCode = codeInput.value.trim().toUpperCase();

  const response = await fetch("/api/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: typedCode })
  });
  const data = await response.json();
  console.log("Join response:", data);

  if (data.error) {
    errorText.textContent = data.error;
    return;
  }

  saveParty(data);
  showPartyScreen();
});

