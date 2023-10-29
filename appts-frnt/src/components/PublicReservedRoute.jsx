import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { isLoggedIn } from '../auth';
const PublicReservedRoute = () => {
    return  !isLoggedIn() ? <Outlet /> : <Navigate to={"/user/dashboard"}  />
}

export default PublicReservedRoute