// Store our API endpoint inside queryUrl
const queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

const lightMap = L.tileLayer(
	'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?' +
		'access_token=pk.eyJ1IjoidHNsaW5kbmVyIiwiYSI6ImNqaWNhdTFzdzFuam4za21sc3ZiMmN5bDEifQ.5Il8Y1QtwyMFWCa1JkDY_Q'
);

const satMap = L.tileLayer(
	'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?' +
		'access_token=pk.eyJ1IjoidHNsaW5kbmVyIiwiYSI6ImNqaWNhdTFzdzFuam4za21sc3ZiMmN5bDEifQ.5Il8Y1QtwyMFWCa1JkDY_Q'
);

const streetmap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution:
		'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets',
	accessToken: API_KEY
});

const darkmap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution:
		'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.dark',
	accessToken: API_KEY
});

const baseMaps = {
	'Street Map': streetmap,
	'Dark Map': darkmap,
	Satellite: satMap,
	'Light Map': lightMap
};

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
	let earthquakeMarkers = [];

	for (let i = 0; i < data.features.length; i++) {
		let color = '';
		let mag = data.features[i].properties.mag;
		if (mag >= 5) {
			color = '#FF0000';
		} else if (mag >= 4) {
			color = '#FF6900';
		} else if (mag >= 3) {
			color = '#FFD300';
		} else if (mag >= 2) {
			color = '#C2FF00';
		} else if (mag >= 1) {
			color = '#58FF00';
		} else {
			color = '#00FF00';
		}
		earthquakeMarkers.push(
			L.circle([ data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0] ], {
				fillOpacity: 0.75,
				color: color,
				fillColor: color,
				// Adjust radius
				radius: mag * 15000
			}).bindPopup(`<h1>${data.features[i].properties.place}</h1>
         <hr>
         <h3>Date: ${new Date(data.features[i].properties.time)}</h3>
         <h3>Magnitude: ${mag}</h3>`)
		);
	}
	let earthquakeLayer = L.layerGroup(earthquakeMarkers);

	let myMap = L.map('map', {
		center: [ 37.09, -95.71 ],
		zoom: 6,
		layers: [ streetmap, earthquakeLayer ]
	});

	let legend = L.control({ position: 'bottomright' });

	legend.onAdd = function(map) {
		var div = L.DomUtil.create('div', 'info legend');
		div.innerHTML += 'Magnitude<br><hr>';
		let colors = [ '#00FF00', '#58FF00', '#C2FF00', '#FFD300', '#FF6900', '#FF0000' ];
		let grades = [ '0-1', '1-2', '2-3', '3-4', '4-5', '5+' ];

		// loop through our density intervals and generate a label with a colored square for each interval
		for (var i = 0; i < 6; i++) {
			div.innerHTML +=
				'<div><i style="background:' + colors[i] + '">&nbsp&nbsp&nbsp&nbsp</i> ' + grades[i] + '</div>';
		}

		return div;
	};

	legend.addTo(myMap);

	let faults = new L.layerGroup();
	console.log(faults);
	function faultStyle(feature) {
		return {
			weight: 2,
			color: 'orange'
		};
	}

	L.geoJson(plates, {
		style: faultStyle
	}).addTo(faults);
	faults.addTo(myMap);

	let overlayMaps = {
		Earthquakes: earthquakeLayer,
		Faults: faults
	};

	L.control.layers(baseMaps, overlayMaps).addTo(myMap);
});
