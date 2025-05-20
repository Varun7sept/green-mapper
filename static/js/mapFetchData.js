// Helper function to check if a feature is fully within bounds
function isFeatureWithinBounds(feature, bounds) {
    if (!feature.geometry || feature.geometry.type !== "Polygon") return false;

    const coordinates = feature.geometry.coordinates[0];
    return coordinates.every(([lng, lat]) =>
        lng >= bounds.getWest() && lng <= bounds.getEast() &&
        lat >= bounds.getSouth() && lat <= bounds.getNorth()
    );
}

// Helper function to determine if a feature qualifies as green space
function isGreenSpace(feature) {
    const properties = feature.properties;
    return [
        "park",
        "garden",
        "nature_reserve",
        "forest",
        "meadow",
        "grass",
        "orchard",
        "recreation_ground"
    ].includes(properties.leisure || properties.landuse);
}

// Deduplicate features by geometry or ID
function deduplicateFeatures(features) {
    const uniqueFeatures = new Map();
    features.forEach(feature => {
        const uniqueKey = feature.id || JSON.stringify(feature.geometry.coordinates);
        if (!uniqueFeatures.has(uniqueKey)) {
            uniqueFeatures.set(uniqueKey, feature);
        }
    });
    return Array.from(uniqueFeatures.values());
}

// Fetch building and feature data
async function fetchBuildingData(bounds) {
    console.log("New area selected.");
    console.log('fetchBuildingData called with bounds:', bounds);

    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
    console.log('Bounding box:', bbox);
    console.log(`Fetching data for bounding box: ${bbox}`);

    const query = `
        [out:json];
        (
            way["building"](${bbox});
            relation["building"](${bbox});
            way["amenity"="parking"](${bbox});
            way["leisure"="park"](${bbox});
            way["leisure"="garden"](${bbox});
            way["landuse"="forest"](${bbox});
            way["landuse"="meadow"](${bbox});
            way["landuse"="grass"](${bbox});
            way["landuse"="recreation_ground"](${bbox});
            way["highway"="pedestrian"](${bbox});
        );
        out geom;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);
        const data = await response.json();
        console.log("Data fetched successfully.");

        // Convert fetched data to GeoJSON
        let geojsonData = convertToGeoJSON(data);
        console.log(`Converting Overpass data to GeoJSON...`);
        console.log(`Converted ${geojsonData.features.length} features to GeoJSON.`);

        // Deduplicate features
        geojsonData.features = deduplicateFeatures(geojsonData.features);
        console.log(`Deduplicated to ${geojsonData.features.length} unique features.`);

        // Add containment flag to features
        geojsonData.features.forEach(feature => {
            feature.properties.isContained = isFeatureWithinBounds(feature, bounds);
        });
        console.log("Features tagged for containment within bounds.");

        // Log areas for debugging
        geojsonData.features.forEach(feature => {
            if (feature.properties.isContained) {
                const area = calculateArea(feature); // Use consistent area calculation
                console.log(`Feature ID: ${feature.id || "N/A"}, Area: ${area.toFixed(2)} m²`);
            }
        });

        // Display data on the map
        displayBuildingData(geojsonData);

        // Save categorized footprints to the server
        saveCategorizedFootprints(geojsonData);

        // Trigger geojsonUpdated event
        const geojsonEvent = new CustomEvent("geojsonUpdated", { detail: { geojsonData } });
        document.dispatchEvent(geojsonEvent);
        console.log("geojsonUpdated event dispatched with data:", geojsonData);

    } catch (error) {
        console.error('Failed to fetch building data:', error);
        alert('Failed to fetch building data. Check console for details.');
    }
}

// Attach function to global window object
window.fetchBuildingData = fetchBuildingData;
