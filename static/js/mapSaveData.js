// Save categorized GeoJSON to the server
async function saveCategorizedFootprints(geojsonData) {
    console.log("Sending categorized footprints to the server...");
    const categories = {
        greenspace: [],
        parking: [],
        buildings: [],
        pedestrian: [],
        others: []
    };

    geojsonData.features.forEach(feature => {
        const properties = feature.properties;

        if (
            properties['leisure'] === 'park' || 
            properties['leisure'] === 'garden' || 
            properties['leisure'] === 'nature_reserve' || 
            properties['landuse'] === 'forest' || 
            properties['landuse'] === 'meadow' || 
            properties['landuse'] === 'grass' || 
            properties['landuse'] === 'orchard' || 
            properties['landuse'] === 'recreation_ground'
        ) {
            categories.greenspace.push(feature);
        } else if (
            properties['amenity'] === 'parking' || 
            properties['parking'] === 'street' || 
            properties['amenity'] === 'charging_station'
        ) {
            categories.parking.push(feature);
        } else if (
            properties['highway'] === 'pedestrian' || 
            properties['landuse'] === 'plaza' || 
            properties['amenity'] === 'marketplace' || 
            properties['public_transport'] === 'platform'
        ) {
            categories.pedestrian.push(feature);
        } else if (
            properties['building:levels'] || 
            properties['tourism'] === 'hotel' || 
            properties['tourism'] === 'attraction' || 
            properties['amenity'] === 'restaurant' || 
            properties['amenity'] === 'cafe' || 
            properties['amenity'] === 'fast_food' || 
            properties['amenity'] === 'bar' || 
            properties['amenity'] === 'school' || 
            properties['amenity'] === 'university'
        ) {
            categories.buildings.push(feature);
        } else {
            categories.others.push(feature);
        }
    });

    for (const [category, features] of Object.entries(categories)) {
        if (features.length > 0) {
            await fetch('/save-footprints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category: category,
                    geojson: {
                        type: "FeatureCollection",
                        features: features
                    }
                })
            });
            console.log(`Saved category: ${category}, Count: ${features.length}`);
        }
    }
}