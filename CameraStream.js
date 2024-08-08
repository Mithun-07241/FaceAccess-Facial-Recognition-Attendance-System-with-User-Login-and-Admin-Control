import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import './CameraStream.css';

function App() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState([]);
  const webcamRef = useRef(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-attendance');
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const handleTakeImages = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const response = await axios.post('http://localhost:5000/take-images', { id, name, image: imageSrc });
      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  const handleTrackImages = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const response = await axios.post('http://localhost:5000/track-images', { image: imageSrc });
      alert(response.data.message);
      fetchAttendance();
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className="App">
      <h1>Face Recognition Attendance System</h1>
      <div className="form-container">
        <div>
          <label>ID:</label>
          <div></div>
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div><span>‏‏‎ ‎‏‏‎ ‎</span></div>
        <div>
          <label>Name:</label>
          <div></div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        
        <div>
          <button onClick={handleTakeImages}>Take Images</button>
          <span>‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎</span>
          <button onClick={handleTrackImages}>Track Images</button>
        </div>

        <div><span>‏‏‎ ‎‏‏‎ ‎</span></div>
        
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
