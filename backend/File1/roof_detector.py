import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from PIL import Image
from io import BytesIO
import logging
from datetime import datetime, timedelta
import random

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
@app.route('/')
def index():
    return jsonify({'status': 'ok', 'message': 'HydroSense API is running!'})

# --- In-memory "databases" ---
community_projects = [
    {"id": 1, "name": "R. Sharma", "location_name": "Koregaon Park, Pune", "lat": 18.5362, "lng": 73.8939, "water_saved": 85000, "structure_type": "Recharge Pit", "image_url": "https://i.imgur.com/S6b6gl3.jpeg"},
    {"id": 2, "name": "A. Desai", "location_name": "Aundh, Pune", "lat": 18.5626, "lng": 73.8051, "water_saved": 120000, "structure_type": "Recharge Well", "image_url": "https://i.imgur.com/As7b21e.jpeg"},
    {"id": 3, "name": "P. Nair", "location_name": "Hinjawadi, Pune", "lat": 18.5912, "lng": 73.7389, "water_saved": 250000, "structure_type": "Recharge Trench", "image_url": "https://i.imgur.com/S6b6gl3.jpeg"}
]
vendors = [
    {"id": 1, "name": "Pune Hardware Mart", "type": "Supplier", "location": "Budhwar Peth", "lat": 18.519, "lng": 73.853, "rating": 4.5, "contact": "9876543210", "services": ["Pipes", "Cement", "Gravel"]},
    {"id": 2, "name": "Shree Ram Construction", "type": "Contractor", "location": "Kothrud", "lat": 18.507, "lng": 73.807, "rating": 4.8, "contact": "9876543211", "services": ["Recharge Pit", "Recharge Trench"]},
    {"id": 3, "name": "Deccan Water Solutions", "type": "Supplier", "location": "Deccan Gymkhana", "lat": 18.521, "lng": 73.841, "rating": 4.2, "contact": "9876543212", "services": ["Filters", "Geotextiles", "Pipes"]},
    {"id": 4, "name": "AquaFlow Experts", "type": "Contractor", "location": "Viman Nagar", "lat": 18.567, "lng": 73.916, "rating": 4.9, "contact": "9876543213", "services": ["Recharge Well", "Consultancy"]},
    {"id": 5, "name": "Builders' Depot", "type": "Supplier", "location": "Hadapsar", "lat": 18.503, "lng": 73.928, "rating": 4.4, "contact": "9876543214", "services": ["Sand", "Gravel", "Boulders"]},
    {"id": 6, "name": "Green Earth Builders", "type": "Contractor", "location": "Baner", "lat": 18.560, "lng": 73.777, "rating": 4.7, "contact": "9876543215", "services": ["All Structures", "Landscaping"]}
]
subsidies = [
    {"id": "s1", "name": "State Water Conservation Grant", "type": "percentage", "value": 0.20, "max_value": 5000, "description": "20% of project cost, up to a maximum of ₹5,000."},
    {"id": "s2", "name": "Central Ground Water Board (CGWB) Scheme", "type": "flat", "value": 4000, "max_value": 4000, "description": "Flat ₹4,000 incentive for installing a certified recharge system."},
    {"id": "s3", "name": "Municipal Corporation Rebate", "type": "percentage", "value": 0.15, "max_value": 3000, "description": "15% rebate on material costs, up to ₹3,000 for city residents."}
]

class RoofDetector:
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
    try:
        data = request.json
        lat, lng, zoom = float(data['lat']), float(data['lng']), int(data.get('zoom', 19))
        image = detector.get_satellite_image(lat, lng, zoom)
        roof_pixels, _ = detector.detect_roof_area(image)
        area_sq_m = detector.pixels_to_area(roof_pixels, zoom, lat)
        coverage_ratio = roof_pixels / (image.shape[0] * image.shape[1])
        confidence = 'high' if coverage_ratio > 0.3 else 'medium' if coverage_ratio > 0.1 else 'low'
        return jsonify({'success': True, 'roof_area': round(area_sq_m), 'confidence': confidence, 'method': 'Python Backend + OpenCV'})
    except Exception as e:
        logger.error(f"Error in roof detection: {str(e)}")
        return jsonify({'success': False, 'error': str(e), 'fallback_area': 100}), 500

@app.route('/get_weather', methods=['POST'])
def get_weather():
    try:
        data = request.json
        lat, lng = float(data['lat']), float(data['lng'])
        end_date, start_date = datetime.now(), datetime.now() - timedelta(days=365)
        api_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lng}&start_date={start_date.strftime('%Y-%m-%d')}&end_date={end_date.strftime('%Y-%m-%d')}&daily=precipitation_sum"
        weather_data = requests.get(api_url).json()
        daily_rainfall = weather_data.get('daily', {}).get('precipitation_sum', [])
        total_rainfall = sum(filter(None, daily_rainfall))
        monthly_data = [{'month': datetime(2000, i + 1, 1).strftime('%b'), 'rainfall': 0} for i in range(12)]
        for i, date_str in enumerate(weather_data.get('daily', {}).get('time', [])):
            if daily_rainfall[i] is not None:
                monthly_data[int(date_str.split('-')[1]) - 1]['rainfall'] += daily_rainfall[i]
        rainy_days = sum(1 for day in daily_rainfall if day is not None and day > 1.0)
        intensity = 'High' if total_rainfall > 1200 else 'Low' if total_rainfall < 600 else 'Medium'
        monthly_totals = [m['rainfall'] for m in monthly_data]
        reliability = max(0.6, 1 - (np.std(monthly_totals) / np.mean(monthly_totals))) if np.mean(monthly_totals) > 0 else 0.75
        return jsonify({'success': True, 'data': {'annualAverage': round(total_rainfall, 2), 'monthlyData': monthly_data, 'rainyDays': rainy_days, 'intensity': intensity, 'reliability': round(reliability, 2)}})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def simulate_gis_data(lat, lng):
    base_rainfall = 800 + (lat - 20) * 20
    base_gw_depth = 15 - (lng - 75) * 2
    return {"rainfall": random.uniform(base_rainfall - 200, base_rainfall + 200), "groundwater_depth": random.uniform(max(5, base_gw_depth - 5), base_gw_depth + 10), "permeability": random.uniform(3, 9)}

@app.route('/get_suitability_grid', methods=['POST'])
def get_suitability_grid():
    try:
        data = request.json
        lat, lng = float(data['lat']), float(data['lng'])
        grid_size, cell_size = 10, 0.001
        features = []
        start_lat, start_lng = lat - (grid_size / 2) * cell_size, lng - (grid_size / 2) * cell_size
        for i in range(grid_size):
            for j in range(grid_size):
                min_lng, min_lat = start_lng + j * cell_size, start_lat + i * cell_size
                max_lng, max_lat = min_lng + cell_size, min_lat + cell_size
                gis_data = simulate_gis_data(min_lat + cell_size / 2, min_lng + cell_size / 2)
                rainfall_norm = min(gis_data["rainfall"] / 1500, 1)
                gw_norm = 1 - min(gis_data["groundwater_depth"] / 30, 1)
                perm_norm = gis_data["permeability"] / 10
                score = (rainfall_norm * 0.4) + (gw_norm * 0.3) + (perm_norm * 0.3)
                features.append({"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[min_lng, min_lat], [max_lng, min_lat], [max_lng, max_lat], [min_lng, max_lat], [min_lng, min_lat]]]}, "properties": {"suitability_score": round(score * 10, 2), **gis_data}})
        return jsonify({"type": "FeatureCollection", "features": features})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'roof-detector'})

@app.route('/get_community_projects', methods=['GET'])
def get_community_projects():
    return jsonify(community_projects)

@app.route('/add_community_project', methods=['POST'])
def add_community_project():
    data = request.json
    if not all(k in data for k in ['name', 'location_name', 'water_saved', 'structure_type']):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    new_project = {"id": len(community_projects) + 1, "name": data['name'], "location_name": data['location_name'], "lat": data.get('lat'), "lng": data.get('lng'), "water_saved": int(data['water_saved']), "structure_type": data['structure_type'], "image_url": "https://i.imgur.com/As7b21e.jpeg"}
    community_projects.append(new_project)
    logger.info(f"Added new community project for {new_project['name']}")
    return jsonify({'success': True, 'project': new_project}), 201

@app.route('/get_vendors', methods=['GET'])
def get_vendors():
    return jsonify(vendors)

@app.route('/get_subsidies', methods=['GET'])
def get_subsidies():
    return jsonify(subsidies)

@app.route('/get_app_stats', methods=['GET'])
def get_app_stats():
    try:
        assessments_completed = len(community_projects)
        liters_saved_annually = sum(p['water_saved'] for p in community_projects)
        water_cost_per_liter = 0.05
        total_monetary_savings = liters_saved_annually * water_cost_per_liter
        average_annual_savings = (total_monetary_savings / assessments_completed) if assessments_completed > 0 else 0
        stats = {"assessmentsCompleted": assessments_completed, "litersSavedAnnually": liters_saved_annually, "averageAnnualSavings": round(average_annual_savings)}
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error in app stats generation: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Roof Detection Backend Server...")
    app.run(host='0.0.0.0', port=5000, debug=True)