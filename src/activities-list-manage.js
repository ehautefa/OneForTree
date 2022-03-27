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

// Écriture dans le document
function writeActivity(textToAdd) {
  // Réception du document
  document.getElementById("activitiesList").innerHTML += "<p>" + textToAdd + "</p>";
  console.log("actif");
}