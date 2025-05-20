from flask import Flask, render_template, request, jsonify
import os
import json
from shapely.geometry import shape, Polygon
from shapely.ops import transform
import pyproj

app = Flask(__name__)

# Directories
OUTPUT_DIR = os.path.join('assets', 'footprints_output')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Projection for accurate area (WGS84 -> Web Mercator in meters)
project = pyproj.Transformer.from_crs('EPSG:4326', 'EPSG:3857', always_xy=True).transform

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/save-footprints', methods=['POST'])
def save_footprints():
    data = request.json
    category = data.get('category')
    geojson = data.get('geojson')

    if not category or not geojson:
        return jsonify({'error': 'Invalid data'}), 400

    file_path = os.path.join(OUTPUT_DIR, f'{category}.geojson')
    with open(file_path, 'w') as file:
        json.dump(geojson, file)

    return jsonify({'message': f'Footprints for {category} saved successfully'}), 200


@app.route('/analyze-footprints', methods=['GET'])
def analyze_footprints():
    greenspace_file = os.path.join(OUTPUT_DIR, 'greenspace.geojson')
    
    if not os.path.exists(greenspace_file):
        return jsonify({'error': 'greenspace.geojson not found'}), 404

    with open(greenspace_file) as f:
        geojson = json.load(f)

    total_green_area = 0
    green_feature_count = 0

    for feature in geojson.get('features', []):
        try:
            geom = shape(feature['geometry'])
            projected_geom = transform(project, geom)
            area = projected_geom.area
            if area > 0:
                total_green_area += area
                green_feature_count += 1
        except Exception as e:
            print(f"Error processing feature: {e}")
            continue

    return jsonify({
        'green_features': green_feature_count,
        'total_green_area_m2': round(total_green_area, 2)
    })


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
