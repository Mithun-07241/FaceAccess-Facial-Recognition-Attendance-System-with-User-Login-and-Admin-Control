import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import {io} from 'socket.io-client';
import './CameraStream.css';

const socket = io('http://localhost:5000');

function App() {
  
  const [attendance, setAttendance] = useState([]);
  const webcamRef = useRef(null);

  useEffect(() => {
    fetchAttendance();

    const socket = new WebSocket('ws://localhost:5000');

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received attendance update:', data);
      setAttendance(data.attendance);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socket.close();
    };
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-attendance');
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };


  return (
    <div className="App">
      <h1>Face Recognition Attendance System</h1>
      <div className="form-container">
        <div className="webcam-container">
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam-video" />
        </div>
      </div>
      <div className="attendance-panel">
        <h2>Today's Attendance</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record, index) => {
              const [name, status, timestamp] = record.split(',');
              return (
                <tr key={index}>
                  <td>{name}</td>
                  <td>{status}</td>
                  <td>{timestamp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
