import React, { useEffect, useState } from 'react';
import './AttendancePercentage.css';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

const UserNames = () => {
  const [userNames, setUserNames] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/get-user-names')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setUserNames(data);
      })
      .catch(error => console.error('Error fetching user names:', error));
  }, []);

  const handleLiveButtonClick = () => {
    navigate('/live');
  };

  const handleCardClick = (employee) => {
    setSelectedEmployee(employee);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
  };

  return (
    <div className="user-names-container">
      <h2>Employee Info</h2>
      <br />
      <div className="user-cards">
        {userNames.map((employee, index) => (
          <div key={index} className="user-card" onClick={() => handleCardClick(employee)}>
            <div className="user-avatar">
              <img src={require('./Assests/istockphoto-1327592506-612x612.jpg')} alt={employee.name} />
            </div>
            <div className="user-info">
              <h3>{employee.name}</h3>
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={!!selectedEmployee}
        onRequestClose={closeModal}
        contentLabel="Employee Details"
        className="modal"
        overlayClassName="overlay"
      >
        {selectedEmployee && (
          <><div className="employee-details-fullscreen">
            <div className="employee-card">
              <div className="employee-avatar">
                <img src={require('./Assests/istockphoto-1327592506-612x612.jpg')} alt={selectedEmployee.name} />
              </div>
              <div className="employee-info">
                <h2>{selectedEmployee.name}</h2>
                <div className="employee-general-info">
                  <table>
                    <tbody>
                      <tr>
                        <td>Role:</td>
                        <td>{selectedEmployee.role}</td>
                      </tr>
                      <tr>
                        <td>E-MAIL:</td>
                        <td>{selectedEmployee.email}</td>
                      </tr>
                      <tr>
                        <td>CONTACT NO.:</td>
                        <td>{selectedEmployee.contact}</td>
                      </tr>
                      <tr>
                        <td>Days Present:</td>
                        <td>{selectedEmployee.daysPresent}</td>
                      </tr>
                      <tr>
                        <td>Days Absent:</td>
                        <td>{selectedEmployee.daysAbsent}</td>
                      </tr>
                      <tr>
                        <td>Total Days:</td>
                        <td>{selectedEmployee.totalDays}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div><button onClick={closeModal} className="close-button">Close</button></>
        )}
      </Modal>
      <div className="live-button-container">
        <button onClick={handleLiveButtonClick}>Live</button>
      </div>
    </div>
  );
};

export default UserNames;
