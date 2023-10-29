import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "reactstrap";
import Base from "./components/Base";
import { useEffect } from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/user-routes/Signup";
import Services from "./pages/Services";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Userdashboard from "./pages/user-routes/Userdashboard";
import Archived from "./pages/user-routes/Archived";
import Privateroute from "./components/Privateroute";
import ProfileInfo from "./pages/user-routes/ProfileInfo";
import UserProvider from "./context/UserProvider";
import { isLoggedIn,getCurrentUserDetail } from './auth';
import PublicReservedRoute from "./components/PublicReservedRoute";

function App() {

  const [user, setUser] = useState(undefined);
  
  useEffect(() => {
    const fetchData = async () => {
      const userData = await getCurrentUserDetail();
    setUser(userData)
    };
    fetchData();

}, [])

if (user === undefined) {
  // Render a loading state or any other UI while the user data is being fetched
  return (
    <UserProvider>        
      <BrowserRouter>
        <ToastContainer position="bottom-center" />
        <Routes>
        {!isLoggedIn() && <Route path="/" element={<Navigate to="/app/login" />} />}
          <Route path="/" element={<Navigate to="/user/dashboard" />} />

          <Route path="/user" element={<Privateroute />}>
            <Route path="dashboard" element={<Userdashboard />} />
            <Route path="signup" element={<Signup />} />
            <Route path="archived" element={<Archived />} />
          </Route>

          <Route path="/app" element={<PublicReservedRoute />}>
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

  return (
    <UserProvider>        
      <BrowserRouter>
        <ToastContainer position="bottom-center" />
        <Routes>
        {!isLoggedIn() && <Route path="/" element={<Navigate to="/app/login" />} />}
          <Route path="/" element={<Navigate to="/user/dashboard" />} />

          <Route path="/user" element={<Privateroute />}>
            <Route path="dashboard" element={<Userdashboard />} />
            <Route path="archived" element={<Archived />} />
            {
              user.depId === 1 && <Route path="signup" element={<Signup />} />
            }
          </Route>

          <Route path="/app" element={<PublicReservedRoute />}>
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
