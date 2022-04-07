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

function createElementFromHTML() {
  var div = document.createElement('div');
  div.className = "notification"
  div.innerHTML = '<div class="notification-img">Icon</div><div class="notification-text">A notification message..</div>';
  setTimeout(() => {div.classList.add("show")}, 100);
  setTimeout(() => {div.classList.remove("show")}, 10000);
  // Change this to div.childNodes to support multiple top-level nodes.
  return div;
}

// Écriture dans le document
function writeActivity(textToAdd) {
  // Réception du document
  // document.getElementById("activitiesList").innerHTML += "<p>" + textToAdd + "</p>";
  document.getElementById("activitiesList").appendChild(createElementFromHTML());


  console.log("actif");
}