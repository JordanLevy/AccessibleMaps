$(window).bind('resize', function(e)
{
	document.getElementById("myMap").style.width = "100%";
	document.getElementById("myMap").style.height = "100vh";
});


helpSidebarOpen = false;
synth = window.speechSynthesis;
var map;
var currentLocationPin = null;
zoomLevel = 13;
var map = null;

function speak(content){
	var utterThis = new SpeechSynthesisUtterance(content);
	utterThis.pitch = 1.0;
	utterThis.rate = 0.9;
	synth.speak(utterThis);
}     

/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openNav() {
	if(helpSidebarOpen){
		return;
	}
	helpSidebarOpen = true;
	document.getElementById("mySidebar").style.width = "250px";
	document.getElementById("main").style.marginLeft = "250px";
	document.getElementById("myMap").style.marginLeft = "250px";
	document.getElementById("openSidebarBtn").value = '<- Say "Close"';
	$('#myMap').width("-=250");

	utterText = 'Here is a list of commands you can say. For more info on a specific command, say, "about", and then the command you would like information about. For example, try saying, about, show.';
	speak(utterText);
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
	if(!helpSidebarOpen){
		return;
	}
	helpSidebarOpen = false;
	document.getElementById("mySidebar").style.width = "0";
	document.getElementById("main").style.marginLeft = "0";
	$('#myMap').width("+=250");
	document.getElementById("myMap").style.marginLeft = "0";
	document.getElementById("openSidebarBtn").value = '-> Say "Help"';
}

function toggleNav(){
	if(!helpSidebarOpen){
		openNav();
	}
	else {
		closeNav();
	}
}

function howToUse(){
	if(!helpSidebarOpen){
		openNav();
	}
	utterText = 'Control the map with your voice. To open this list of commands to use, say, "Help" at any time';
	speak(utterText);
}

function about(i){
	switch(i){
		//help
		case 0:
			utterText = "The help command opens this sidebar";
			break;
		//how to use
		case 1:
			utterText = "The how to use command briefly explains how the app works"
			break;
		//clear map
		case 2:
			utterText = "The clear map command will remove all pins from the map"
			break;
		//show ___
		case 3:
			utterText = "The show command will show you a location on the map. For example, show libraries will display all libraries on the map."
			break;
		//plan my day
		case 4:
			utterText = "The plan my day command will show you a random museum, library, and park to explore"
			break;
		//where am i
		case 5:
			utterText = "The where am I command will show your current location on the map"
			break;
		//zoom in
		case 6:
			utterText = "The zoom in command will increase the map zoom"
			break;
		//zoom out
		case 7:
			utterText = "The zoom out command will decrease the map zoom"
			break;
		//about
		case 8:
			utterText = 'For more info on a specific command, say, "about", and then the command you would like information about. For example, try saying, about, show.'
			break;
		default:
			utterText = ""
			break;
	}
	speak(utterText);
}

function planMyDay(){
	clearMap();
	museumName = showOne(museums, Math.floor(Math.random() * museums.features.length));
	libraryName = showOne(libraries, Math.floor(Math.random() * libraries.features.length));
	parkName = showOne(parks, Math.floor(Math.random() * parks.features.length));
	utterText = `We recommend spending your day at ${museumName}, ${libraryName}, and ${parkName}`;
	speak(utterText)
}

function getLocation() {
	navigator.geolocation.getCurrentPosition(showPosition);
}

function showPosition(position) {
	if(currentLocationPin){
		currentLocationPin.setLocation(new Microsoft.Maps.Location(
					position.coords.latitude,
					position.coords.longitude
				));
	}
	else
	{
		currentLocationPin = new Microsoft.Maps.Pushpin(
					new Microsoft.Maps.Location(
						position.coords.latitude,
						position.coords.longitude
					),
					{title: "You are here"}
					);
		map.entities.push(currentLocationPin);
	}
	epsilon = 0.001;
	box=new Microsoft.Maps.LocationRect.fromEdges(position.coords.latitude+epsilon,position.coords.longitude-epsilon,position.coords.latitude-epsilon,position.coords.longitude+epsilon);
	map.setView({ bounds: box });

}

function zoomIn(){
	zoomLevel = map.getZoom();
	if(zoomLevel == 18){
		utterText = `This is the maximum zoom level`;
	}
	else
	{
		zoomLevel++;
		map.setView({ zoom: zoomLevel });
		utterText = `Now at zoom level ${zoomLevel}`;
	}
	speak(utterText);
}

function zoomOut(){
	zoomLevel = map.getZoom();
	if(zoomLevel == 0){
		utterText = `This is the minimum zoom level`;
	}
	else
	{
		zoomLevel--;
		map.setView({ zoom: zoomLevel });
		utterText = `Now at zoom level ${zoomLevel}`;
	}
	speak(utterText);

}

function drawPolygon(coords, name){
	polyCoords = [];
	for(i=0; i < coords.length; i++){
		polyCoords = [...polyCoords, new Microsoft.Maps.Location(coords[i][1], coords[i][0])];
	}

	polyCoords = [...polyCoords, polyCoords[0]];

    //Create a polygon
    var polygon = new Microsoft.Maps.Polygon(polyCoords, {
        fillColor: 'rgba(0, 255, 0, 0.5)',
        strokeColor: 'red',
        strokeThickness: 2,
        title: name
    });

    //Add the polygon to map
    map.entities.push(polygon);
}

function showOne(type, i){
	if(type === museums){
		// add a pushpin to the map
		map.entities.push(
		new Microsoft.Maps.Pushpin(
		new Microsoft.Maps.Location(
			// use the latitude & longitude data for the pushpin position
			type.features[i].properties.LATITUDE,
			type.features[i].properties.LONGITUDE
		),
		// use the name for the label 
		{title: type.features[i].properties.NAME}
		));
	}
	else if(type === parks){
		drawPolygon(type.features[i].geometry.coordinates[0], type.features[i].properties.NAME);
		// add a pushpin to the map
		map.entities.push(
		new Microsoft.Maps.Pushpin(
		new Microsoft.Maps.Location(
			// use the latitude & longitude data for the pushpin position
			type.features[i].geometry.coordinates[0][0][1],
			type.features[i].geometry.coordinates[0][0][0]
		),
		// use the name for the label 
		{title: type.features[i].properties.NAME}
		));
	}
	else{
		// add a pushpin to the map
		map.entities.push(
		new Microsoft.Maps.Pushpin(
		new Microsoft.Maps.Location(
			// use the latitude & longitude data for the pushpin position
			type.features[i].properties.LATITUDE,
			type.features[i].properties.LONGITUDE
		),
		// use the name for the label 
		{title: type.features[i].properties.NAME}
		));
	}
	return type.features[i].properties.NAME;
}

function showAll(type){
	len = Math.min(100, type.features.length);
	var i;
	for (i = 0; i < len ; i++) 
	{
		showOne(type, i);
	}
}

function clearMap(){
	for (i = map.entities.getLength() - 1; i >= 0; i--) {
		var item = map.entities.get(i);
		if (item instanceof Microsoft.Maps.Pushpin || item instanceof Microsoft.Maps.Polygon) {
		map.entities.removeAt(i);
		}
	}
}
	// Welcome the user after they click the start button
	/*document.getElementById("start").onclick = function()
	{
	var synth = window.speechSynthesis;
	var utterText = "Welcome to Hamilton!";
	var utterThis = new SpeechSynthesisUtterance(utterText);
	utterThis.pitch = 1.0;
	utterThis.rate = 0.9;
	synth.speak(utterThis);
	}*/

	if (annyang) {

	// Commands are defined as keys and values in an object, the key is the 
	// text for the command, and the value is callback function (i.e. event 
	// handler) to call for the command
	var commands = {

		// If "show firestations" or "show libraries" are uttered, the map will 
		// be populated with pushpins for firestations or libraries
		//
		// We use the firestations.js and libraries.js data above to do so, note 
		// that we know how to access the data structure be examining the data 
		// structure... so we can see for example that firestations.features 
		// contains an array of objects with firestation data, and we can see 
		// that firestations.features[i].properties contains latitude, longitude
		// and name data.  
		//
		// You could use a tool like this to help you visualize the data:
		//    http://jsonviewer.stack.hu/
		//
		"show *type": 
		function(type)
		{
			// if type includes "fire" we assume the user wants to see firestations
			if (type.includes("fire"))
			{
				showAll(firestations);
				speak("Here are all the firestations");
			}
			// if type includes "libraries" we assume user wants to see libraries
			else if (type.includes("libraries"))
			{
				showAll(libraries);
				speak("Here are all the libraries");
			}
			// if type includes "museums" we assume user wants to see museums
			else if (type.includes("museums"))
			{
				showAll(museums);
				speak("Here are all the museums");
			}
			// if type includes "parks" we assume user wants to see parks
			else if (type.includes("parks"))
			{
				showAll(parks);
				speak("Here are all the parks");
			}
		},

		// If "clear map" is uttered all pushpins are removed from the map
		"clear map" :
		function()
		{
		// Code to remove all pushpins is taken directly from the API docs:
		// https://www.bing.com/api/maps/sdkrelease/mapcontrol/isdk/deletepushpins
			clearMap();
			speak("Clearing map");
		},

		// Any other utterance will be caught by this case, and we use the 
		// Bing Maps geolocation service to find a latitude and longitude 
		// position based on the utterance:
		//  https://www.bing.com/api/maps/sdkrelease/mapcontrol/isdk/searchbyaddress#JS
		// We then place a pushpin on the map at that location.
		//
		// So if we say "Dundas, Ontario" or "Toronto, Ontario" it will 
		// attempt to find the location and put a pushpin on the map there
		"help":
		function()
		{
			openNav();
		},
		"close":
		function()
		{

			closeNav();
		},
		"how to (use)":
		function()
		{
			howToUse();
		},

		"about *cmd":
		function(cmd)
		{
			if(cmd.includes("help"))
				about(0);
			else if(cmd.includes("how to"))
				about(1);
			else if(cmd.includes("clear map"))
				about(2);
			else if(cmd.includes("show"))
				about(3);
			else if(cmd.includes("plan my day"))
				about(4);
			else if(cmd.includes("where am i"))
				about(5);
			else if(cmd.includes("zoom in"))
				about(6);
			else if(cmd.includes("zoom out"))
				about(7);
			else{
				about(8);
			}
		},

		"plan my day":
		function(){
			planMyDay();
		},

		"where am i":
		function()
		{
			getLocation();
			speak("Here is your current location");
		},
		"zoom in":
		function()
		{
			zoomIn();
		},
		"zoom out":
		function()
		{
			zoomOut();
		},
		"*catchall" :
		function(catchall) 
		{
			var requestOptions = {
			bounds: map.getBounds(),
			where: catchall,
			callback: function (answer, userData) {
				map.setView({ bounds: answer.results[0].bestView });
				map.entities.push(
				new Microsoft.Maps.Pushpin(
					answer.results[0].location,
					{title: catchall}
				)
				);
				speak("Here is " + catchall);
			}
		};
		searchManager.geocode(requestOptions);

		}
	};
	
	// Add our commands to annyang
	annyang.addCommands(commands);
	
	// Start listening. You can call this here, or attach this call to an event, button, etc.
	annyang.start({ autoRestart: true, continuous: true });
	}


	// Loads the map, called after Bing map library finishes loading
	function loadmap()
	{
	// Create a map centered on Hamilton, Ontario
	map = new Microsoft.Maps.Map(document.getElementById("myMap"), 
		{
		center: new Microsoft.Maps.Location(43.2557, -79.8711),
		minZoom: 1,
		maxZoom: 19,
		zoom: zoomLevel,
		// we could set additional options when we create the map...
		// mapTypeId: Microsoft.Maps.MapTypeId.aerial,
		// zoom: 12        
		});

	// Load the search manager that allows us to search for locations 
	// (lat and long positions) based on an address, e.g. Toronto, Ontario
	Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
		searchManager = new Microsoft.Maps.Search.SearchManager(map);
	});
	}