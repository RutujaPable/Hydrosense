import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from PIL import Image
from io import BytesIO
import logging
from skimage import measure, morphology
from skimage.filters import threshold_otsu
from datetime import datetime, timedelta
import random # NEW: For data simulation

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# --- EXISTING RoofDetector CLASS (No changes here) ---
class RoofDetector:
    # ... (The entire RoofDetector class code remains unchanged)
    def __init__(self):
        logger.info("RoofDetector initialized")
    
    def get_satellite_image(self, lat, lng, zoom=19):
        try:
            n = 2 ** zoom
            x = int((lng + 180) / 360 * n)
            y = int((1 - np.arcsinh(np.tan(np.radians(lat))) / np.pi) / 2 * n)
            tile_sources = [
                f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{y}/{x}",
                f"https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={zoom}",
            ]
            for url in tile_sources:
                try:
                    response = requests.get(url, timeout=10)
                    if response.status_code == 200:
                        image = Image.open(BytesIO(response.content))
                        return np.array(image)
                except:
                    continue
            raise Exception("Failed to fetch satellite image from all sources")
        except Exception as e:
            logger.error(f"Error fetching satellite image: {str(e)}")
            raise
    
    def preprocess_image(self, image):
        if len(image.shape) == 3 and image.shape[2] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
        blurred = cv2.GaussianBlur(image, (5, 5), 0)
        lab = cv2.cvtColor(blurred, cv2.COLOR_RGB2LAB)
        lab[:,:,0] = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8)).apply(lab[:,:,0])
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        return enhanced
    
    def detect_roof_area(self, image):
        try:
            processed_image = self.preprocess_image(image)
            hsv = cv2.cvtColor(processed_image, cv2.COLOR_RGB2HSV)
            gray = cv2.cvtColor(processed_image, cv2.COLOR_RGB2GRAY)
            roof_mask_color = self.detect_by_color(hsv)
            roof_mask_texture = self.detect_by_texture(gray)
            roof_mask_edges = self.detect_by_edges(gray)
            combined_mask = cv2.bitwise_or(roof_mask_color, roof_mask_texture)
            combined_mask = cv2.bitwise_or(combined_mask, roof_mask_edges)
            final_mask = self.postprocess_mask(combined_mask)
            roof_pixels = np.sum(final_mask > 0)
            return roof_pixels, final_mask
        except Exception as e:
            logger.error(f"Error in roof detection: {str(e)}")
            return self.simple_roof_detection(image)
    
    def detect_by_color(self, hsv):
        roof_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
        color_ranges = [
            ([0, 0, 50], [180, 50, 200]), ([0, 100, 100], [10, 255, 255]),
            ([170, 100, 100], [180, 255, 255]), ([8, 50, 50], [25, 255, 200]),
            ([90, 50, 50], [130, 255, 200])
        ]
        for (lower, upper) in color_ranges:
            lower = np.array(lower)
            upper = np.array(upper)
            mask = cv2.inRange(hsv, lower, upper)
            roof_mask = cv2.bitwise_or(roof_mask, mask)
        return roof_mask
    
    def detect_by_texture(self, gray):
        from skimage.feature import local_binary_pattern
        radius = 3
        n_points = 8 * radius
        lbp = local_binary_pattern(gray, n_points, radius, method='uniform')
        kernel = np.ones((15, 15), np.float32) / 225
        lbp_var = cv2.filter2D(lbp, -1, kernel)
        _, texture_mask = cv2.threshold(lbp_var.astype(np.uint8), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return 255 - texture_mask
    
    def detect_by_edges(self, gray):
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        edge_mask = np.zeros_like(gray)
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:
                epsilon = 0.02 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                if 4 <= len(approx) <= 8:
                    cv2.fillPoly(edge_mask, [contour], 255)
        return edge_mask
    
    def postprocess_mask(self, mask):
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (10, 10))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
        if num_labels > 1:
            largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
            mask = np.where(labels == largest_label, 255, 0).astype(np.uint8)
        return mask
    
    def simple_roof_detection(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            roof_pixels = cv2.contourArea(largest_contour)
        else:
            roof_pixels = np.sum(thresh > 0)
        return roof_pixels, thresh
    
    def pixels_to_area(self, pixels, zoom_level, lat):
        base_meters_per_pixel = 156543.03392
        meters_per_pixel = base_meters_per_pixel * np.cos(np.radians(lat)) / (2 ** zoom_level)
        area_per_pixel = meters_per_pixel ** 2
        return pixels * area_per_pixel


detector = RoofDetector()

@app.route('/detect_roof', methods=['POST'])
def detect_roof():
    # ... (Unchanged)
    try:
        data = request.json
        lat = float(data['lat'])
        lng = float(data['lng'])
        zoom = int(data.get('zoom', 19))
        logger.info(f"Detecting roof at coordinates: {lat}, {lng}")
        image = detector.get_satellite_image(lat, lng, zoom)
        roof_pixels, mask = detector.detect_roof_area(image)
        area_sq_m = detector.pixels_to_area(roof_pixels, zoom, lat)
        image_area = image.shape[0] * image.shape[1]
        coverage_ratio = roof_pixels / image_area
        if coverage_ratio > 0.3: confidence = 'high'
        elif coverage_ratio > 0.1: confidence = 'medium'
        else: confidence = 'low'
        return jsonify({
            'success': True, 'roof_area': round(area_sq_m), 'confidence': confidence,
            'coverage_ratio': round(coverage_ratio, 3), 'method': 'advanced_cv'
        })
    except Exception as e:
        logger.error(f"Error in roof detection: {str(e)}")
        return jsonify({'success': False, 'error': str(e), 'fallback_area': 100}), 500


@app.route('/get_weather', methods=['POST'])
def get_weather():
    # ... (Unchanged)
    try:
        data = request.json
        lat = float(data['lat'])
        lng = float(data['lng'])
        logger.info(f"Fetching weather data for coordinates: {lat}, {lng}")
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        start_date_str = start_date.strftime('%Y-%m-%d')
        end_date_str = end_date.strftime('%Y-%m-%d')
        api_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lng}&start_date={start_date_str}&end_date={end_date_str}&daily=precipitation_sum"
        response = requests.get(api_url)
        if response.status_code != 200:
            raise Exception("Failed to fetch weather data from Open-Meteo")
        weather_data = response.json()
        daily_rainfall = weather_data.get('daily', {}).get('precipitation_sum', [])
        if not daily_rainfall:
            raise Exception("No rainfall data returned from API")
        total_rainfall = sum(filter(None, daily_rainfall))
        monthly_data = [{'month': 'Jan', 'rainfall': 0}, {'month': 'Feb', 'rainfall': 0}, {'month': 'Mar', 'rainfall': 0}, {'month': 'Apr', 'rainfall': 0}, {'month': 'May', 'rainfall': 0}, {'month': 'Jun', 'rainfall': 0}, {'month': 'Jul', 'rainfall': 0}, {'month': 'Aug', 'rainfall': 0}, {'month': 'Sep', 'rainfall': 0}, {'month': 'Oct', 'rainfall': 0}, {'month': 'Nov', 'rainfall': 0}, {'month': 'Dec', 'rainfall': 0}]
        dates = weather_data.get('daily', {}).get('time', [])
        for i, date_str in enumerate(dates):
            month_index = int(date_str.split('-')[1]) - 1
            if daily_rainfall[i] is not None:
                monthly_data[month_index]['rainfall'] += daily_rainfall[i]
        rainy_days = sum(1 for day in daily_rainfall if day is not None and day > 1.0)
        intensity = 'Medium'
        if total_rainfall > 1200: intensity = 'High'
        elif total_rainfall < 600: intensity = 'Low'
        monthly_totals = [month['rainfall'] for month in monthly_data]
        std_dev = np.std(monthly_totals)
        reliability = max(0.6, 1 - (std_dev / np.mean(monthly_totals))) if np.mean(monthly_totals) > 0 else 0.75
        processed_data = {
            'annualAverage': round(total_rainfall, 2),
            'monthlyData': [{'month': m['month'], 'rainfall': round(m['rainfall'], 2)} for m in monthly_data],
            'rainyDays': rainy_days, 'intensity': intensity, 'reliability': round(reliability, 2)
        }
        return jsonify({'success': True, 'data': processed_data})
    except Exception as e:
        logger.error(f"Error in weather data fetching: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'roof-detector'})

# --- NEW: GIS Site Suitability Endpoint ---
def simulate_gis_data(lat, lng):
    """Simulates GIS data layers for a given location."""
    # Base values can be influenced by lat/lng for more realistic simulation
    base_rainfall = 800 + (lat - 20) * 20
    base_gw_depth = 15 - (lng - 75) * 2
    
    data = {
        "rainfall": random.uniform(base_rainfall - 200, base_rainfall + 200),
        "groundwater_depth": random.uniform(max(5, base_gw_depth - 5), base_gw_depth + 10),
        "permeability": random.uniform(3, 9) # Score out of 10
    }
    return data

@app.route('/get_suitability_grid', methods=['POST'])
def get_suitability_grid():
    """Generates a GeoJSON grid with simulated suitability scores."""
    try:
        data = request.json
        lat = float(data['lat'])
        lng = float(data['lng'])
        
        grid_size = 10 # 10x10 grid
        cell_size = 0.001 # Approx 111 meters
        
        features = []
        
        start_lat = lat - (grid_size / 2) * cell_size
        start_lng = lng - (grid_size / 2) * cell_size

        for i in range(grid_size):
            for j in range(grid_size):
                # Calculate corners of the grid cell
                min_lng = start_lng + j * cell_size
                min_lat = start_lat + i * cell_size
                max_lng = min_lng + cell_size
                max_lat = min_lat + cell_size
                
                # Center of cell for simulation
                cell_center_lat = min_lat + cell_size / 2
                cell_center_lng = min_lng + cell_size / 2
                
                gis_data = simulate_gis_data(cell_center_lat, cell_center_lng)
                
                # Calculate suitability score (0-10)
                # Normalize values to be between 0 and 1
                rainfall_norm = min(gis_data["rainfall"] / 1500, 1)
                gw_norm = 1 - min(gis_data["groundwater_depth"] / 30, 1) # Lower depth is better
                perm_norm = gis_data["permeability"] / 10
                
                # Weighted average
                score = (rainfall_norm * 0.4) + (gw_norm * 0.3) + (perm_norm * 0.3)
                
                features.append({
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [min_lng, min_lat], [max_lng, min_lat],
                            [max_lng, max_lat], [min_lng, max_lat],
                            [min_lng, min_lat]
                        ]]
                    },
                    "properties": {
                        "suitability_score": round(score * 10, 2),
                        **gis_data
                    }
                })
        
        geojson = {"type": "FeatureCollection", "features": features}
        return jsonify(geojson)

    except Exception as e:
        logger.error(f"Error in suitability grid generation: {str(e)}")
        return jsonify({'error': str(e)}), 500
@app.route('/get_community_projects', methods=['GET'])
def get_community_projects():
    """Returns the list of community projects."""
    return jsonify(community_projects)

@app.route('/add_community_project', methods=['POST'])
def add_community_project():
    """Adds a new project to the community list."""
    data = request.json
    
    # Basic validation
    if not all(k in data for k in ['name', 'location_name', 'water_saved', 'structure_type']):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
    new_project = {
        "id": len(community_projects) + 1,
        "name": data['name'],
        "location_name": data['location_name'],
        "lat": data.get('lat'),
        "lng": data.get('lng'),
        "water_saved": int(data['water_saved']),
        "structure_type": data['structure_type'],
        "image_url": "https://i.imgur.com/As7b21e.jpeg" # Default image for new submissions
    }
    
    community_projects.append(new_project)
    logger.info(f"Added new community project for {new_project['name']}")
    return jsonify({'success': True, 'project': new_project}), 201

# --- END NEW SECTION ---
if __name__ == '__main__':
    logger.info("Starting Roof Detection Backend Server...")
    app.run(host='0.0.0.0', port=5000, debug=True)