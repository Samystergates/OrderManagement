import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { isLoggedIn } from '../auth';
const Privateroute = () => {
    return  isLoggedIn() ? <Outlet /> : <Navigate to={"/app/login"}  />
}

export default Privateroute