// metricsUpdate.js

// Track metrics for outliers and properties outside the defined area
let totalOutlierAreaPurged = 0;
let propertiesOutsideAreaCount = 0;

// Function to display metrics
function displayMetrics(metrics) {
    const overviewContainer = document.getElementById("metrics-overview");
    if (overviewContainer) {
        overviewContainer.innerHTML = `
            <h3>Metrics Overview</h3>
            <ul>
                <p>Green Space: ${metrics.greenspace}</p>
                <p>Parking: ${metrics.parking}</p>
                <p>Buildings: ${metrics.buildings}</p>
                <p>Pedestrian Areas: ${metrics.pedestrian}</p>
                <p>Other Features: ${metrics.others}</p>
                <p>Total Green Space Area: ${metrics.totalGreenSpaceArea.toFixed(2)} m²</p>
                <p>Total Property Footprint Area: ${metrics.totalFootprintArea.toFixed(2)} m²</p>
                <p>Properties with Outlier Area Data: ${metrics.totalOutlierAreaPurged.toFixed(2)} m² purged</p>
                <p>Properties Outside Defined Area: ${metrics.propertiesOutsideAreaCount} purged</p>
            </ul>
        `;
        console.log("Metrics displayed.");
    } else {
        console.error("Metrics overview container not found.");
    }
}

// Function to calculate areas and handle outliers
function calculateArea(feature) {
    if (!feature.geometry || feature.geometry.type !== "Polygon") {
        console.warn("Invalid geometry type for area calculation:", feature.geometry);
        return 0;
    }

    const coordinates = feature.geometry.coordinates[0];
    if (!coordinates || coordinates.length < 3) {
        console.warn("Insufficient coordinates for area calculation:", coordinates);
        return 0;
    }

    const earthRadius = 6378137;
    let area = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
        const [lng1, lat1] = coordinates[i];
        const [lng2, lat2] = coordinates[i + 1];

        const x1 = lng1 * (Math.PI / 180) * earthRadius * Math.cos((lat1 + lat2) / 2 * (Math.PI / 180));
        const y1 = lat1 * (Math.PI / 180) * earthRadius;
        const x2 = lng2 * (Math.PI / 180) * earthRadius * Math.cos((lat1 + lat2) / 2 * (Math.PI / 180));
        const y2 = lat2 * (Math.PI / 180) * earthRadius;

        area += x1 * y2 - x2 * y1;
    }

    const calculatedArea = Math.abs(area / 2);
    // Define outlier threshold (adjust as necessary)
    const outlierThreshold = 1000000; // Example: 1,000,000 m² (1km²)

    if (calculatedArea > outlierThreshold) {
        console.warn(`Outlier area detected and ignored: ${calculatedArea} m²`);
        totalOutlierAreaPurged += calculatedArea;
        return 0;
    }

    return calculatedArea;
}

// Function to update metrics
function updateMetrics(geojsonData) {
    if (!geojsonData || typeof geojsonData !== "object" || !geojsonData.features) {
        console.error("Invalid GeoJSON data provided to updateMetrics. Data received:", geojsonData);
        return;
    }

    // Reset outliers and outside area counters
    totalOutlierAreaPurged = 0;
    propertiesOutsideAreaCount = 0;

    // Filter out features outside the defined area
    geojsonData.features = geojsonData.features.filter(feature => {
        if (!feature.properties.isContained) {
            propertiesOutsideAreaCount++;
            return false;
        }
        return true;
    });

    console.log("Processing metrics...");
    console.log("Filtered GeoJSON data to include only contained features:", geojsonData);

    let greenspaceCount = 0;
    let parkingCount = 0;
    let buildingCount = 0;
    let pedestrianCount = 0;
    let othersCount = 0;
    let totalGreenSpaceArea = 0;
    let totalFootprintArea = 0;

    geojsonData.features.forEach(feature => {
        const properties = feature.properties;
        const area = calculateArea(feature);

        totalFootprintArea += area;

        if (properties.leisure === "park" || properties.leisure === "garden") {
            greenspaceCount++;
            totalGreenSpaceArea += area;
        } else if (properties.amenity === "parking") {
            parkingCount++;
        } else if (properties.building || properties["building:levels"]) {
            buildingCount++;
        } else if (properties.highway === "pedestrian") {
            pedestrianCount++;
        } else {
            othersCount++;
        }
    });

    const metricsData = {
        greenspace: greenspaceCount,
        parking: parkingCount,
        buildings: buildingCount,
        pedestrian: pedestrianCount,
        others: othersCount,
        totalGreenSpaceArea,
        totalFootprintArea,
        totalOutlierAreaPurged,
        propertiesOutsideAreaCount,
    };

    console.log("Metrics calculated:", metricsData);

    displayMetrics(metricsData);

    // Calculate Green Space Accessibility
    calculateGreenSpaceAccessibility(metricsData.totalGreenSpaceArea, metricsData.totalFootprintArea);
}

// Attach `updateMetrics` to the global window object for use in non-module environments
window.updateMetrics = updateMetrics;
