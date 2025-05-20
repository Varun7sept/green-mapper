// Convert Overpass JSON to GeoJSON
function convertToGeoJSON(overpassData) {
    const geojson = {
        type: "FeatureCollection",
        features: []
    };

    overpassData.elements.forEach(element => {
        if (element.type === "way" && element.geometry) {
            const coordinates = element.geometry.map(point => [point.lon, point.lat]);
            geojson.features.push({
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [coordinates]
                },
                properties: {
                    id: element.id,
                    height: element.tags?.height,
                    "building:levels": element.tags?.["building:levels"],
                    leisure: element.tags?.leisure,
                    amenity: element.tags?.amenity,
                    landuse: element.tags?.landuse,
                    natural: element.tags?.natural,
                    highway: element.tags?.highway
                }
            });
        }
    });

    return geojson;
}