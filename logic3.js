// Creating the map object
let myMap = L.map("map", {
    center: [40.7128, -74.0059],
    zoom: 11
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Use this link to get the GeoJSON data.
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

d3.json(link).then(function(response) {
    
    console.log(response);

    response.features.forEach(feature => {
        
    const coordinates = feature.geometry.coordinates;
    const properties = feature.properties;

    
    function getColor(magnitude) {
            // Example logic: Assign colors based on magnitude ranges or use a gradient
            // You can replace this logic with your custom color assignment based on magnitude
            let color;
            if (magnitude < 15) {
                color = '#00FF00'; // Example color for lower magnitudes
            } else if (magnitude < 50) {
                color = '#FFFF00'; // Example color for moderate magnitudes
            } else {
                color = '#FF0000'; // Example color for higher magnitudes
            }
        
            // Calculate opacity based on magnitude
            const opacity = Math.min(1, magnitude / 10); // Adjust the divisor for different opacity scaling
        
            // Combine color and opacity
            return color + Math.round(opacity * 255).toString(16).padStart(2, '0'); // Convert opacity to hexadecimal
        }

        var markerColor = getColor(coordinates[2]);
        const markerHtmlStyles = `
            background-color: ${markerColor};
            width: 1rem;
            height: 1rem;
            display: block;
            left: -1.5rem;
            top: -1.5rem;
            position: relative;
            border-radius: 3rem 3rem 0;
            transform: rotate(45deg);
            border: .5px solid rgba(0, 0, 0, 0.2); // Light black outline
        `;

        const icon = L.divIcon({
            className: "my-custom-pin",
            iconAnchor: [0, 24],
            labelAnchor: [-6, 0],
            popupAnchor: [0, -36],
            html: `<span style="${markerHtmlStyles}"></span>`
        });
        
        L.circle([coordinates[1], coordinates[0]], {
            color: markerColor,
            fillColor: markerColor,
            fillOpacity: coordinates[2] / 450,
            radius: (coordinates[2] * 1000)
        }).addTo(myMap);
        
        L.marker([coordinates[1], coordinates[0]], { icon: icon })
            .addTo(myMap)
            .bindPopup("<h3>" + properties.place + "<h3><hr><h3>Time: " + new Date(properties.time).toLocaleString() + "<h3><hr><h3>Magnitude: " + coordinates[2] + "</h3>");
    
        });
        var legend = L.control({ position: "bottomright" });

        // Function to generate legend content

        function getLegendColor(magnitude) {
            // Example logic: Assign colors based on magnitude ranges or use a gradient
            // You can replace this logic with your custom color assignment based on magnitude
            let color;
            if (magnitude < 15) {
                color = '#00FF00'; // Example color for lower magnitudes
            } else if (magnitude < 50) {
                color = '#FFFF00'; // Example color for moderate magnitudes
            } else {
                color = '#FF0000'; // Example color for higher magnitudes
            }
            return color;
        }
        legend.onAdd = function (map) {
            var div = L.DomUtil.create("div", "legend");
            var labels = ["<strong>Magnitude Legend</strong>"];
            var magnitudes = [0, 15, 50]; // Magnitude thresholds
        
            // Loop through magnitude thresholds and generate labels
            for (var i = 0; i < magnitudes.length; i++) {
                var color = getLegendColor(magnitudes[i]); // Get color for the magnitude threshold
                var from = magnitudes[i];
                var to = magnitudes[i + 1];
        
                // Create a small color square
                var colorSquare = '<span style="display:inline-block; width: 25px; height: 25px; margin-right: 5px; background-color:' + color + ';"></span>';
        
                // Add color square and label for magnitude range to the legend
                labels.push(
                    colorSquare +
                    (from + (to ? '&ndash;' + to : '+'))
                );
            }
        
            div.innerHTML = labels.join("<br>");
            return div;
        };
        
        // Add legend to the map
        legend.addTo(myMap);


});
