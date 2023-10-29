import React from 'react'
import Base from '../../components/Base'
import { Container } from 'reactstrap'
import { useState } from 'react'
import ArchivedOrders from '../../components/ArchivedOrders'
import { useEffect } from 'react'
import { getCurrentUserDetail } from '../../auth'
import { toast } from 'react-toastify'
import { loadArchivedOrders } from '../../services/order-service'
const Userdashboard = () => {

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const [user, setUser] = useState({})
  //const [posts, setPosts] = useState([])
  const [orders, setOrders] = useState([])
  useEffect(() => {
    setUser(getCurrentUserDetail())
    //loadPostData()
    loadArchOrders()
  }, [])


  function loadArchOrders() {
    loadArchivedOrders().then(data => {
      setOrders([...data])
    })
      .catch(error => {
        console.log(error)
        toast.error("error in loading archived orders")
      })
  }



  return (

    <Base order = {orders} searchTerm={searchTerm} handleSearch={handleSearch}>

        <ArchivedOrders order = {orders} searchTerm={searchTerm} handleSearch={handleSearch}/>
      
    </Base>

  )
}

export default Userdashboard