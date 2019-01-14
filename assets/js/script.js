var config = {
	apiKey: "AIzaSyAkWFzxkdSXpQUMwi7dN3hSBnpaFBnU-eM",
	authDomain: "justastrainschedule.firebaseapp.com",
	databaseURL: "https://justastrainschedule.firebaseio.com",
	projectId: "justastrainschedule",
	storageBucket: "justastrainschedule.appspot.com",
	messagingSenderId: "909967223088"
};
firebase.initializeApp(config);
var database = firebase.database();

function updateTime() {
	$(".current-time").text(moment().format("H:mm:ss")).appendTo(".jumbotron");
}

function calculateTime(firstTrain, frequency) {
	var firstCurrentDiff = moment().diff(moment(firstTrain, "HH:mm"), "minutes");
	var minsAway = frequency - (firstCurrentDiff % frequency);
	var nextArrival = moment().add(minsAway, "minutes").format("HH:mm");
	var result = [];
	result.push(nextArrival);
	result.push(minsAway);
	return result;
}

function updateValue() {
	database.ref().orderByChild("dateAdded").on("child_added", function(snapshot) {
		var firstTrain = snapshot.val().firstTrain;
		var frequency = snapshot.val().frequency;
		var destination = snapshot.val().destination;
		var recordKey = snapshot.key;
		var calcTimes = calculateTime(firstTrain, frequency);
		$("." + recordKey + " .destination").text(destination);
		$("." + recordKey + " .first-train").text(firstTrain);
		$("." + recordKey + " .frequency").text(frequency);
		$("." + recordKey + " .next-train").text(calcTimes[0]);
		$("." + recordKey + " .mins-away").text(calcTimes[1]);
	});
}
$("#submit-button").on("click", function() {
	event.preventDefault();
	var name = $("#name").val().trim();
	var destination = $("#destination").val().trim();
	var firstTrain = $("#first-train").val().trim();
	var frequency = $("#frequency").val().trim();
	database.ref().push({
		name: name,
		destination: destination,
		firstTrain: firstTrain,
		frequency: frequency,
		dateAdded: firebase.database.ServerValue.TIMESTAMP
	});
	$("#name").val(" ");
	$("#destination").val(" ");
	$("#first-train").val(" ");
	$("#frequency").val(" ");
});
$("body").on("click", "#delete-button", function() {
	var selectedValue = $("#select-train").val();
	if (selectedValue === "none") {
		console.log("select value!!!");
	} else {
		database.ref().child(selectedValue).remove();
		$("." + selectedValue).remove();
		$("#edit-destination").val(" ");
		$("#edit-first-train").val(" ");
		$("#edit-frequency").val(" ");
	}
});
$("body").on("click", "#edit-button", function() {
	var destination = $("#edit-destination").val().trim();
	var firstTrain = $("#edit-first-train").val().trim();
	var frequency = $("#edit-frequency").val().trim();
	var selectedValue = $("#select-train").val();
	database.ref().child(selectedValue).update({
		destination: destination,
		firstTrain: firstTrain,
		frequency: frequency
	});
	updateValue();
});
$("#select-train").on("change", function() {
	var selectedValue = $("#select-train").val();
	if (selectedValue === "none") {
		$("#edit-destination").val(" ");
		$("#edit-first-train").val(" ");
		$("#edit-frequency").val(" ");
	} else {
		selectedRecord = database.ref().child(selectedValue);
		selectedRecord.once("value", function(snapshot) {
			var destination = snapshot.val().destination;
			var frequency = snapshot.val().frequency;
			var firstTrain = snapshot.val().firstTrain;
			$("#edit-destination").val(destination);
			$("#edit-first-train").val(firstTrain);
			$("#edit-frequency").val(frequency);
		});
	}
});
database.ref().orderByChild("dateAdded").on("child_added", function(snapshot) {
	var name = snapshot.val().name;
	var destination = snapshot.val().destination;
	var firstTrain = snapshot.val().firstTrain;
	var frequency = snapshot.val().frequency;
	var recordKey = snapshot.key;
	var row = $("<tr>").attr("class", recordKey);
	row.appendTo("#tableBody");
	var calcTimes = calculateTime(firstTrain, frequency);
	$("<td>" + name + "</td>").appendTo(row);
	$("<option>" + name + "</option>").attr("value", recordKey).attr("class", recordKey).appendTo("#select-train");
	$('<td class="destination">' + destination + "</td>").appendTo(row);
	$('<td class="first-train">' + firstTrain + "</td>").appendTo(row);
	$('<td class="frequency">' + frequency + "</td>").appendTo(row);
	$('<td class="next-train">' + calcTimes[0] + "</td>").appendTo(row);
	$('<td class="mins-away">' + calcTimes[1] + "</td>").appendTo(row);
});
setInterval(updateValue, 1000);
setInterval(updateTime, 1000);