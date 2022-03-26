function showActivitiesList(file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
  	// Do something with your data
    document.getElementById("activitiesList").innerHTML = data;
  	console.log(data);
  });
}

showActivitiesList('./src/activities-list.html');