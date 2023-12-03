function startGame() {
    // Redirect to the game screen
    window.location.href = 'game.html';
}


document.addEventListener('DOMContentLoaded', function() {
    const titleMusic = document.getElementById('title-music');
    let hasInteracted = false;
  
    function playTitleMusic() {
      if (!hasInteracted) {
        titleMusic.play();
        hasInteracted = true;
      }
    }
  
    // Add an event listener for any click on the document
    document.addEventListener('click', playTitleMusic);
});