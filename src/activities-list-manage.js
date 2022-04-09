// Affichage de la liste des actions réalisées
/*function showActivitiesList(file) {
    fetch(file)
      .then(response => response.text())
      .then(data => {
        // Do something with your data
        document.getElementById("activitiesList").innerHTML = data;
        console.log(data);
      });
}*/

// showActivitiesList('./src/activities-list.html');

function createNotification(text, image) {
  var div = document.createElement("div");
  div.className = "notification";
  div.innerHTML =
    '<div class="notification-img"> <img class="notification-ico" src="' +
    image +
    '"/> </div> <div class="notification-text">' +
    text +
    "</div>";
  // setTimeout(() => {div.classList.add("show")}, 100);
  setTimeout(() => {
    div.remove();
  }, 6500);
  // Change this to div.childNodes to support multiple top-level nodes.
  return div;
}

// Écriture dans le document
function writeActivity(text, image) {
  // Réception du document
  document
    .getElementById("notificationList")
    .appendChild(createNotification(text, image));
}
