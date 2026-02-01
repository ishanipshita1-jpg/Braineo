function goPlay() {
    window.location.herf ="difficulty.html";

}

function goDifficulty() {
    window.location.herf ="difficulty.html";
    
}

function showHighScore() {
    alert("High Score: " + (localStorage.getItem("highScore")|| 0));
}