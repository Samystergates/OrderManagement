import React from "react";
import Base from "../../components/Base";
import { useState } from "react";
import Orders from "../../components/Orders";
import { useEffect } from "react";
import { getCurrentUserDetail } from "../../auth";
import { toast } from "react-toastify";
import { doLogout } from "../../auth";
import { loadAllOrders } from "../../services/order-service";
import { loadCRMOrders } from "../../services/order-service";
import { ClipLoader } from 'react-spinners';
import { css } from '@emotion/react';
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

const Userdashboard = () => {
  const [isMoreOptionsCanv, setIsMoreOptionsCanv] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setUser(getCurrentUserDetail());
    loadOrders();
  }, []);

  useEffect(() => {
    setUser(getCurrentUserDetail());
    loadOrders();
    
    const socket = new SockJS('http://***.***.**.***:****/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe("/topic/orderUpdate", (message) => {
        const updatedOrders = JSON.parse(message.body);
        setOrders(updatedOrders);
        console.log("socket update", updatedOrders);
      });
    });

    return () => {
      stompClient.disconnect();
    };
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const moreOptionsCanv = () => {
    setIsMoreOptionsCanv(!isMoreOptionsCanv);
  };

  const updateFromCRM = () => {
    setLoading(true);
    loadCRMOrders()
      .then((data) => {
        setOrders([...data]);
        setLoading(false);
        if (data !== null) {
          toast.success("Updated CRM Orders");
        } else {
          toast.error("In The Works");
        }
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);

        toast.error("Error in Loading CRM Orders" + error?.message);
        if (error?.message === "Network Error") {
          doLogout();
          window.location.reload();
        }
      });
  };


  function loadOrders() {
    setLoading(true);
    loadAllOrders()
      .then((data) => {
        setOrders([...data]);
        
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);

        setLoading(false);
        toast.error("error in loading orders" + error?.message);
        if (error?.message === "Network Error") {
          doLogout();
          window.location.reload();
        }
      });
  }

  function reloadOrders(orders){
    setOrders(orders)
  }

  const toggleConfirmation = (val) => {
    if (
      user.departmentsSet[0].depName === "ADMIN"
    ) {
      setConfirmationModal(!confirmationModal);
      if (val === "yes") {  
        updateFromCRM();
      } else if (val === "no") {
      }
    } else {
      toast.error("UnAuthorized Department");
    }
  };

 
  const override = css`
  display: block;
  margin: 0 auto;
`;
  return (
    <div>
    {loading && (
      <>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
            zIndex: 9998, // Set a high z-index
          }}
        ></div>
        <div
          className="sweet-loading"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999, // Set a high z-index to ensure it's on top
          }}
        >
          <ClipLoader css={override} size={150} color={'#123abc'} loading={loading} />
        </div>
      </>
    )}
    <Base
      order={orders}
      searchTerm={searchTerm}
      handleSearch={handleSearch}
      moreOptionsCanv={moreOptionsCanv}
      updateFromCRM={updateFromCRM}
      toggleConfirmation={toggleConfirmation}
    >
      <Orders
        order={orders}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        isMoreOptionsCanv={isMoreOptionsCanv}
        confirmationModal={confirmationModal}
        toggleConfirmation={toggleConfirmation}
        moreOptionsCanv={moreOptionsCanv}
        reloadOrders={reloadOrders}
        loadOrders={loadOrders}
      />
    </Base>
  </div>
  );
};

export default Userdashboard;
