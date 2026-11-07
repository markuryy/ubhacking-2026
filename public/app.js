const createButton = document.getElementById("createButton");
const codeText = document.getElementById("codeText");

createButton.addEventListener("click", async function () {
  const response = await fetch("/api/create", { method: "POST" });
  const data = await response.json();
  console.log("Created party:", data);
});