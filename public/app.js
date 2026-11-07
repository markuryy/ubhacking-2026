let code = "";

const startScreen = document.getElementById("startScreen");
const partyScreen = document.getElementById("partyScreen");
const createButton = document.getElementById("createButton");
const codeText = document.getElementById("codeText");

// eventually we should save the code to local storage so it survives refresh
function saveParty(data){
    code = data.code;
    // show the party screen and hide the current start screen
    startScreen.style.display = "none";
    partyScreen.style.display = "block";
    codeText.textContent = code;
}

createButton.addEventListener("click", async function () {
  const response = await fetch("/api/create", { method: "POST" });
  const data = await response.json();
  console.log("Created party:", data);
  saveParty(data);
});