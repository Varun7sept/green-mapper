// metricsInit.js
// Initialization of metrics functionality

document.addEventListener("geojsonUpdated", function (event) {
    const geojsonData = event.detail.geojsonData;
    if (geojsonData && geojsonData.features) {
        console.log("Valid GeoJSON received for metrics. Updating...");
        updateMetrics(geojsonData);
    } else {
        console.error("Received invalid GeoJSON data. Skipping metrics update.");
    }
});
