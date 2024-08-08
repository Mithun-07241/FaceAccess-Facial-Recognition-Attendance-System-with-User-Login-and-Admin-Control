from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
import base64
import cv2
import numpy as np
import os
import pickle
import time
from datetime import datetime, timedelta
import dlib

app = Flask(__name__)
socketio = SocketIO(app,cors_allowed_origins="http://localhost:3000")
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

# Paths for storing data and models
IMAGE_SAVE_PATH = 'E:/front/login/src/backend/EmployeeDetails/images'
ATTENDANCE_FOLDER = 'E:/front/login/src/backend/Attendance'
MODEL_SAVE_PATH = 'E:/front/login/src/backend/model'
employee_details_path = "E:/front/login/src/backend/EmployeeDetails/images/user_details.txt"
attendance_path = "E:/front/login/src/backend/Attendance"

# Face recognition model and detector initialization
face_recognizer = cv2.face.LBPHFaceRecognizer_create(radius=1, neighbors=8, grid_x=8, grid_y=8)
detector = dlib.get_frontal_face_detector()

# Utility functions
def save_image(name, id, image, count):
    label_path = os.path.join(IMAGE_SAVE_PATH, name)
    if not os.path.exists(label_path):
        os.makedirs(label_path)
    file_name = os.path.join(label_path, f"{name}_{id}_{count}.jpg")
    cv2.imwrite(file_name, image)

def load_training_data():
    faces = []
    labels = []
    for label_dir in os.listdir(IMAGE_SAVE_PATH):
        label_path = os.path.join(IMAGE_SAVE_PATH, label_dir)
        if os.path.isdir(label_path):
            for file_name in os.listdir(label_path):
                if file_name.endswith(".jpg"):
                    img_path = os.path.join(label_path, file_name)
                    image = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                    label = label_dir
                    faces.append(image)
                    labels.append(label)
    return faces, labels

def mark_attendance(name):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    attendance_file = os.path.join(ATTENDANCE_FOLDER, f"attendance_{datetime.now().date()}.txt")
    with open(attendance_file, 'a') as f:
        f.write(f"{name},present,{timestamp}\n")

def train_model():
    faces, labels = load_training_data()
    print(f"Number of faces: {len(faces)}, Number of labels: {len(labels)}")  # Debugging line
    if len(faces) == 0 or len(labels) == 0:
        return False

    label_ids = {name: i for i, name in enumerate(set(labels))}
    ids = [label_ids[name] for name in labels]

    face_recognizer.train(faces, np.array(ids))

    if not os.path.exists(MODEL_SAVE_PATH):
        os.makedirs(MODEL_SAVE_PATH)
    face_recognizer.save(os.path.join(MODEL_SAVE_PATH, 'face_recognizer.xml'))
    with open(os.path.join(MODEL_SAVE_PATH, 'label_ids.pkl'), 'wb') as f:
        pickle.dump(label_ids, f)

    return True

def get_user_details(user_id):
    user_data_file = os.path.join(IMAGE_SAVE_PATH, 'user_details.txt')
    with open(user_data_file, 'r') as f:
        for line in f:
            uid, name = line.strip().split(',')
            if uid == user_id:
                return name
    return None

# Routes for handling image capture, tracking, and attendance
@app.route('/take-images', methods=['POST'])
@cross_origin(origin='http://localhost:3000')
def take_images():
    data = request.get_json()
    id = data['id']
    name = data['name']
    image_data = data['image']

    image_data = image_data.split(',')[1]
    image_data = base64.b64decode(image_data)
    image_np = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    faces = detector(gray_image)

    if len(faces) > 0:
        # Save user details to a text file
        user_details_file = os.path.join(IMAGE_SAVE_PATH, 'user_details.txt')
        with open(user_details_file, 'a') as f:
            f.write(f"{id},{name}\n")

        # Save images with user details
        for i in range(100):
            for count, face in enumerate(faces):
                x, y, w, h = face.left(), face.top(), face.width(), face.height()
                face_img = gray_image[y:y+h, x:x+w]
                save_image(name, id, face_img, i*len(faces)+count)
                time.sleep(0.1)  # Adjust if necessary to avoid capturing the same frame repeatedly

        train_model()

        return jsonify({'message': 'Images taken and trained successfully!'})
    else:
        return jsonify({'error': 'No face detected in the image'}), 400

@app.route('/track-images', methods=['POST'])
@cross_origin(origin='http://localhost:3000')
def track_images():
    data = request.get_json()
    image_data = data['image']

    image_data = image_data.split(',')[1]
    image_data = base64.b64decode(image_data)
    image_np = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    faces = detector(gray_image)

    if len(faces) > 0:
        (x, y, w, h) = faces[0].left(), faces[0].top(), faces[0].width(), faces[0].height()
        face = gray_image[y:y+h, x:x+w]

        face_recognizer.read(os.path.join(MODEL_SAVE_PATH, 'face_recognizer.xml'))
        with open(os.path.join(MODEL_SAVE_PATH, 'label_ids.pkl'), 'rb') as f:
            label_ids = pickle.load(f)

        label_id, confidence = face_recognizer.predict(face)
        label_ids_inv = {v: k for k, v in label_ids.items()}
        name = label_ids_inv.get(label_id, "Unknown")

        confidence_threshold = 50
        if confidence < confidence_threshold:
            mark_attendance(name)
            return jsonify({'message': f'{name} is present!'})
        else:
            return jsonify({'message': 'Unknown face detected.'})
    else:
        return jsonify({'message': 'No face detected in the image'}), 400

@app.route('/get-attendance', methods=['GET'])
@cross_origin(origin='http://localhost:3000')
def get_attendance():
    today = datetime.now().strftime("%Y-%m-%d")
    attendance_file = os.path.join(ATTENDANCE_FOLDER, f"attendance_{today}.txt")
    attendance_records = []

    if os.path.exists(attendance_file):
        with open(attendance_file, 'r') as f:
            attendance_records = f.readlines()

    return jsonify({'attendance': attendance_records})
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

# Emit attendance data to all connected clients
def send_attendance_updates():
    today = datetime.now().strftime("%Y-%m-%d")
    attendance_file = os.path.join(ATTENDANCE_FOLDER, f"attendance_{today}.txt")
    attendance_records = []

    if os.path.exists(attendance_file):
        with open(attendance_file, 'r') as f:
            attendance_records = f.readlines()

    print(f"Sending attendance update: {attendance_records}")  # Debugging output

    socketio.emit('attendance_update', {'attendance': attendance_records}, broadcast=True)

# Example trigger for sending updates
# Call this function wherever you update attendance data
def update_attendance():
    # Update attendance logic here
    send_attendance_updates()

@app.route('/get-user-names', methods=['GET'])
def get_user_names():
    employees = []
    with open(employee_details_path, 'r') as f:
        lines = f.readlines()
        for line in lines:
            user_id, name, role, email, contact = line.strip().split(',')
            employees.append({
                'user_id': user_id,
                'name': name,
                'role': role,
                'email': email,
                'contact': contact
            })
    
    # Calculate attendance details
    total_days = len(os.listdir(attendance_path))
    for employee in employees:
        present_days = 0
        for file_name in os.listdir(attendance_path):
            file_path = os.path.join(attendance_path, file_name)
            with open(file_path, 'r') as f:
                attendance_lines = f.readlines()
                for attendance_line in attendance_lines:
                    attendance_name, present, timestamp = attendance_line.strip().split(',')
                    if attendance_name == employee['name']:
                        if present.lower() == 'present':
                            present_days += 1
                        break
        absent_days = total_days - present_days
        employee['daysPresent'] = present_days
        employee['daysAbsent'] = absent_days
        employee['totalDays'] = total_days
    
    return jsonify(employees)



if __name__ == '__main__':
    socketio.run(app, debug=True)
