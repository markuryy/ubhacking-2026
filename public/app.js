let code = localStorage.getItem("code");
let token = localStorage.getItem("token");

// so we only vibrate once, not on every poll after both are ready
let hasBuzzed = false;

const startScreen = document.getElementById("startScreen");
const waitingScreen = document.getElementById("waitingScreen");
const partyScreen = document.getElementById("partyScreen");
const LGHScreen = document.getElementById("LGHScreen");

const createButton = document.getElementById("createButton");
const readyCheckbox = document.getElementById("readyCheckbox");
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

    leaveButton.style.display = "none";
}

function showStartScreen(){
    // show the start screen and hide the current screen (for going back to home after a party finishes)
    hideAllScreens();
    startScreen.style.display = "block";
}

function showWaitingScreen(){
    // show the waiting screen and hide the current screen
    hideAllScreens();
    waitingScreen.style.display = "block";
    codeText.textContent = localStorage.getItem("code");
    leaveButton.style.display = "block";
}

function showPartyScreen(){
    // show the party screen and hide the current screen
    hideAllScreens();
    partyScreen.style.display = "block";
    leaveButton.style.display = "block";
}

function showLGHScreen(){
    // show the "let's go home" screen and hide the current screen
    hideAllScreens();
    LGHScreen.style.display = "block";
    leaveButton.style.display = "block";
}

// skipBuzz is true when the person is already looking at the screen
// (they just tapped the checkbox, or just opened the page)
async function checkStatus(skipBuzz){
    // not in a party, so there is nothing to check
    if(!code || !token){
        return;
    }

    const url = "/api/status?code=" + code + "&token=" + token;
    const response = await fetch(url);
    const data = await response.json();
    console.log("Status:", data);

    // the party is gone (e.g. server restarted)
    if (!response.ok) {
        localStorage.removeItem("code");
        localStorage.removeItem("token");
        code = null;
        token = null;
        hideAllScreens();
        startScreen.style.display = "block";
        errorText.textContent = "Your party ended. Create or join a new one.";
        return;
    }

    if (data.status === "no-friend") {
        showWaitingScreen();
    } else if (data.status === "waiting") {
        showPartyScreen();
    } else if (data.status === "both-ready") {
        showLGHScreen();

        // only buzz the person who tapped first (they find out from a poll)
        // the person who tapped second already sees the screen change
        // window.haptics is set up in index.html
        if (window.haptics && hasBuzzed === false && !skipBuzz) {
            window.haptics.trigger("success");
            // only the person who tapped first should see this
            console.log("Buzz!");
        }

        // either way, don't buzz on any later polls
        hasBuzzed = true;
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
    showStartScreen();
})

// check once right away, then every 3 seconds
checkStatus(true);
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

readyCheckbox.addEventListener("change", async function () {
    const isReady = readyCheckbox.checked;
    console.log("Sending ready:", isReady);

    const response = await fetch("/api/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code, token: token, ready: isReady })
    });
    const data = await response.json();
    console.log("Ready response:", data);

    // if the server said no, put the checkbox back how it was
    if (!response.ok) {
        readyCheckbox.checked = !isReady;
    }

    // check right away so both-ready shows up without waiting 3 seconds
    // true = no buzz, since this person just tapped and is looking at the screen
    checkStatus(true);
});