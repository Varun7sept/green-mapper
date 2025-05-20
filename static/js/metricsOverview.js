// metricsOverview.js

// Handles metrics display logic
function displayMetrics(metrics) {
    console.log("Displaying metrics:", metrics);

    if (!metricsDisplayContainer) {
        console.error("Metrics display container not initialized.");
        return;
    }

    let htmlContent = `
        <h3>Metrics Overview</h3>
        <div>
            <p>Greenspace: ${metrics.greenspace}</p>
            <p>Parking: ${metrics.parking}</p>
            <p>Buildings: ${metrics.buildings}</p>
            <p>Pedestrian: ${metrics.pedestrian}</p>
            <p>Others: ${metrics.others}</p>
            <p>Total Green Space Area: ${metrics.totalGreenSpaceArea.toFixed(2)} m²</p>
            <p>Total Property Footprint Area: ${metrics.totalFootprintArea.toFixed(2)} m²</p>
            <p>Properties with Outlier Area Data: ${metrics.totalOutlierAreaPurged.toFixed(2)} m² purged</p>
            <p>Properties Outside Defined Area: ${metrics.propertiesOutsideAreaCount} purged</p>
        </div>
    `;

    metricsDisplayContainer.innerHTML = htmlContent;

    console.log("Metrics displayed.");
}