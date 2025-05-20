// mapsInit.js
window.onload = function () {
    console.log("Initializing maps...");

    // Initialize the main map (area selection)
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    // Search bar functionality
    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const query = searchBar.value.trim();
            if (query) {
                searchForLocation(query);
            }
        }
    });

    // Function to search for a location and update the map view
    function searchForLocation(query) {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const location = data[0];
                    const { lat, lon } = location;

                    map.setView([lat, lon], 15);
                    L.marker([lat, lon]).addTo(map).bindPopup(location.display_name).openPopup();
                } else {
                    alert('Location not found. Please try another search.');
                }
            })
            .catch(error => {
                console.error('Error fetching geocoding data:', error);
            });
    }
    
    // Add drawing tools
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Reference to the drawn rectangle
    let drawnRectangle = null;
    let polygonDisplayRectangle = null; // Rectangle for the polygon display map

    // Initialize the polygon display map
    polygonMap = L.map('polygon-display', {
        zoomControl: false,
        attributionControl: false,
    }).setView([0, 0], 1);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(polygonMap);

    // Configure drawing control
    drawControl = new L.Control.Draw({
        draw: {
            polygon: false,
            circle: false,
            marker: false,
            polyline: false,
            rectangle: {shapeOptions: {color: '#007bff', weight: 3, fillOpacity: 0.1}}
        },
    });
    map.addControl(drawControl);

    // Handle draw events
    map.on('draw:created', function (e) {
        console.log('Draw event triggered');

        // Clear previous drawings
        drawnItems.clearLayers();

        var layer = e.layer;
        if (e.layerType === 'rectangle') {
            var bounds = layer.getBounds();
            console.log('Rectangle drawn with bounds:', bounds);

            // Remove existing rectangle from the area selection map if it exists
            if (drawnRectangle) {
                map.removeLayer(drawnRectangle);
            }

            // Add the rectangle to the area selection map and keep a reference
            drawnRectangle = L.rectangle(bounds, {
                color: '#007bff',
                weight: 2,
                fillOpacity: 0.1
            }).addTo(map);

            // Add the rectangle to the drawn items group
            drawnItems.addLayer(drawnRectangle);

            // Reflect the rectangle on the polygon display map
            if (polygonDisplayRectangle) {
                polygonMap.removeLayer(polygonDisplayRectangle);
            }

            polygonDisplayRectangle = L.rectangle(bounds, {
                color: '#007bff',
                weight: 2,
                fillOpacity: 0.1
            }).addTo(polygonMap);

            // Adjust the polygon display map to fit the rectangle
            polygonMap.fitBounds(bounds);

            // Fetch building data and dispatch the geojsonUpdated event
            fetchBuildingData(bounds).then((geojsonData) => {
                if (geojsonData) {
                    console.log("Dispatching geojsonUpdated event...");
                    const geojsonEvent = new CustomEvent("geojsonUpdated", { detail: { geojsonData } });
                    document.dispatchEvent(geojsonEvent);
                }
            }).catch((error) => {
                console.error("Error in fetching or processing GeoJSON data:", error);
            });
        }
    });

    // Define category colors globally
    categoryColors = {
        greenspace: 'green',
        parking: 'lightblue',
        pedestrian: 'lightgrey',
        buildings: 'yellow',
        others: 'orange'
    };

    console.log("Maps initialized successfully.");
};
