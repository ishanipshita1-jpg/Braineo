const lvl = document.getElementById("level");
const out = document.getElementById("lvl");
const speed = document.getElementById("speed");

out.textContent = lvl.value;

lvl.oninput = () => {
  out.textContent = lvl.value;
};

document.getElementById("start").onclick = () => {
  localStorage.setItem("snakePreferredLevel", lvl.value);
  localStorage.setItem("snakeSpeed", speed.value);
  window.location.href = "snake.html";
};
