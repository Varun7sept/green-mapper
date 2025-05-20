// mapFootprints.js

// Check and use global map definition
function displayBuildingData(geojsonData) {
    if (!polygonMap) {
        console.error('polygonMap is undefined. Ensure it is initialized.');
        return;
    }

    if (buildingsLayer) {
        polygonMap.removeLayer(buildingsLayer);
    }

    const greenspaces = geojsonData.features.filter(feature => 
        feature.properties['leisure'] === 'park' || feature.properties['leisure'] === 'garden'
    );

    // Helper function to calculate distance between two points
    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth radius in meters
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Helper function to calculate color based on distance
    function getColorFromDistance(distance) {
        if (distance === null) return 'grey'; // For excluded buildings
        if (distance <= 500) {
            const ratio = distance / 400;
            const red = Math.min(255, Math.floor(255 * ratio));
            const blue = Math.min(255, Math.floor(255 * (1 - ratio)));
            return `rgb(${red}, 0, ${blue})`;
        }
        return 'red'; // Farther than 500m
    }

    let buildingsWithHeight = 0;
    let buildingsWithoutHeight = 0;

    buildingsLayer = L.geoJSON(geojsonData, {
        style: function (feature) {
            const properties = feature.properties;

            // Greenspaces remain green
            if (properties['leisure'] === 'park' || properties['leisure'] === 'garden') {
                return {
                    color: 'lime',
                    weight: 2,
                    fillColor: 'lime',
                    fillOpacity: 0.5,
                };
            }

            // For buildings
            if (properties['building:levels'] || properties['id']) {
                let minDistance = null;

                if (properties.isContained) {
                    const centroid = feature.geometry.type === 'Polygon' 
                        ? calculateCentroid(feature.geometry.coordinates[0]) 
                        : null;

                    if (centroid) {
                        const [lng, lat] = centroid;

                        // Calculate distance to the nearest greenspace
                        greenspaces.forEach(greenspace => {
                            const greenspaceCentroid = calculateCentroid(
                                greenspace.geometry.coordinates[0]
                            );
                            const distance = calculateDistance(
                                lat,
                                lng,
                                greenspaceCentroid[1],
                                greenspaceCentroid[0]
                            );
                            if (minDistance === null || distance < minDistance) {
                                minDistance = distance;
                            }
                        });
                    }
                }

                const color = getColorFromDistance(minDistance);

                if (properties.isContained) {
                    return {
                        color: color,
                        weight: 2,
                        fillColor: color,
                        fillOpacity: 0.7,
                    };
                } else {
                    // Semi-dark grey for excluded buildings
                    return {
                        color: '#555555',
                        weight: 2,
                        fillColor: '#555555',
                        fillOpacity: 0.5,
                    };
                }
            }

            // Default styling for other features
            return {
                color: 'grey',
                weight: 2,
                fillColor: 'grey',
                fillOpacity: 0.5,
            };
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', function () {
                const props = feature.properties;

                let category = 'others';
                if (props['leisure'] === 'park' || props['leisure'] === 'garden') {
                    category = 'greenspace';
                } else if (props['building:levels'] || props['id']) {
                    category = 'buildings';
                }

                const height =
                    props['height'] ||
                    (props['building:levels']
                        ? props['building:levels'] * 3 + ' m (approx)'
                        : 'N/A');

                const details = `
                    <b>Building ID:</b> ${props.id || 'N/A'}<br>
                    <b>Height:</b> ${height}<br>
                    <b>Category:</b> ${category}<br>
                `;

                L.popup()
                    .setLatLng(layer.getBounds().getCenter())
                    .setContent(details)
                    .openOn(polygonMap);
            });
        },
    }).addTo(polygonMap);

    if (geojsonData.features.length > 0) {
        const bounds = buildingsLayer.getBounds();
        if (bounds.isValid()) {
            polygonMap.fitBounds(bounds);
        }
    } else {
        document.getElementById('polygon-content').innerText =
            'No valid footprints found.';
    }

    console.log(`Displayed ${geojsonData.features.length} footprints on the map.`);
    console.log(`Buildings with height data: ${buildingsWithHeight}`);
    console.log(`Buildings without height data: ${buildingsWithoutHeight}`);
    console.log(
        `Ratio: ${(buildingsWithHeight /
            (buildingsWithHeight + buildingsWithoutHeight) *
            100).toFixed(2)}% have height data.`
    );
}

// Helper function to calculate polygon centroid
function calculateCentroid(latlngs) {
    let xSum = 0, ySum = 0;
    latlngs.forEach(([lng, lat]) => {
        xSum += lng;
        ySum += lat;
    });
    return [xSum / latlngs.length, ySum / latlngs.length];
}
