import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AttendancePage from './AttendancePage';
import LoginPage from './LoginPage';
import AttendancePercentage from './AttendancePercentage';
import LivePage from './LivePage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/attendance" element={<AttendancePage/>} />
        <Route path="" element={<LoginPage />} />
        <Route path="/admin" element={<AttendancePercentage/>} />
        <Route path="/live" element={<LivePage/>} />
      </Routes>
    </Router>
  );
}

export default App;
