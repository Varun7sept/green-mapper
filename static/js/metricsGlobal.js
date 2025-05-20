// metricsGlobal.js
// Global definitions for metrics functionality

var metricsData = {}; // Object to store calculated metrics
var metricsDisplayContainer = document.getElementById('model-display'); // Container for metrics display

// Ensure the container is found
if (!metricsDisplayContainer) {
    console.error("Metrics display container not found.");
}