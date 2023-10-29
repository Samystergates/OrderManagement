import { useContext, useEffect, useState } from "react";
import { TfiDownload, TfiAngleDoubleLeft } from "react-icons/tfi";
import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, NavbarText } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch , faTruckLoading,faTruckPickup, faRefresh, faStickyNote} from '@fortawesome/free-solid-svg-icons';
import { NavLink as ReactLink, useLocation } from "react-router-dom";
import { doLogout, getCurrentUserDetail, isLoggedIn } from "../auth";
import "../css/navbar.css";
import userContext from "../context/userContext";

const CustomNavbar = ({ order, searchTerm, handleSearch, moreOptionsCanv, updateFromCRM , toggleConfirmation,confirmationModal}) => {
  const userContextData = useContext(userContext);
  const [isOpen, setIsOpen] = useState(false);
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState(undefined);
  const currentDate = new Date();
  const uniqueOrderNumbers = [];
  const uniqueOrderNames = [...new Set(order?.map(obj => obj.orderNumber))];
  const uniqueCount = uniqueOrderNames.length;

  const location = useLocation();
  const isArchivedPage = location.pathname.includes('/user/archived');

  const filteredOrders = order?.filter(obj => {
    if (!uniqueOrderNumbers.includes(obj.orderNumber)) {
      uniqueOrderNumbers.push(obj.orderNumber);
      return true;
    }
    return false;
  });

const notExpiredOrders = filteredOrders?.filter(obj => {
    const deliveryDate = new Date(obj.deliveryDate);
    return currentDate > deliveryDate;
  });

  useEffect(() => {
    setLogin(isLoggedIn());
    setUser(getCurrentUserDetail());
  }, [login]);

  const logout = () => {
    doLogout(() => {
      setLogin(false);
      userContextData.setUser({
        data: null,
        login: false
      });
    });
  };

  return (
    <Navbar expand="xl" light style={{backgroundColor: '#f5f5f5', }}>
      <div style={{backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center',flexDirection: 'column', justifyContent: 'space-between'  }}>
        <div style={{left:'0', marginLeft:'80px',bottom:'0', height:'100%'}}>
          {!isArchivedPage && (
            <div  style={{cursor: 'pointer',width:'150px',marginLeft:'8px', fontSize:'17px', marginTop:'10px', borderRadius: '8px',alignItems: 'center',justifyContent: 'center',}}>
              <NavLink tag={ReactLink} className='orderPageHover' to="/user/archived" style={{marginLeft:'45px',paddingLeft:'20px',paddingTop:'10px',paddingBottom:'10px',alignItems: 'center',justifyContent: 'center',
              border: '1px solid #ccc', borderRadius: '8px',  }}>
                Archief
              </NavLink>
            </div>
          )}
          {isArchivedPage && (
            <div >
            <NavLink  className='orderPageHover' style={{cursor: 'pointer',marginLeft:'0px', fontSize:'17px',marginBottom:'8px',
            border: '1px solid #ccc', borderRadius: '8px', padding: '10px',alignItems: 'center',}} tag={ReactLink} to="/user/dashboard">
              To Dashboard Orders
            </NavLink>
          </div>
          )}
           {!isArchivedPage && (
            <div style={{bottom:'0', marginTop:'5px'}}>
            <NavbarBrand>
              Vervallen Orders: {notExpiredOrders?.length}/{uniqueCount}
            </NavbarBrand>
          </div>
           )}
        </div>
      </div>

      <div style={{ marginTop:'70px',marginLeft:'40px'}}>
        <NavbarBrand>
          <input
            type="text"
            placeholder="Zoeken..."
            value={searchTerm}
            onChange={handleSearch}
            style={{padding: '6px 8px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            width: '250px',
            fontSize: '16px',
            outline: 'none',
            height: '38px',}}
          /></NavbarBrand>
        </div>

        <div  style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', textAlign: 'center', }}>
          <h1 style={{fontSize:'50px'}}>Onderhanden Orders</h1>
        </div>
        {!isArchivedPage && (
        <div style={{ display: 'flex' , bottom:'0', marginTop:'50px', justifyContent: 'flex-end',marginRight:'20px'}}>
        <div  onClick={toggleConfirmation} className='hoverButton1' style={{width:'110px', cursor: 'pointer',border: '1px solid #ccc', borderRadius: '15px',padding: '10px',bottom:'0', marginRight:'15px',}}>
        <NavLink tag={ReactLink} style={{  color: '#333', fontSize: '14px', fontWeight: 'bold',textAlign: 'center' }}>
            <h6>Verversen <span style={{ display: 'block',}}>
            <TfiDownload />
        </span></h6>
            </NavLink>
        </div>

        <div className='hoverButton2' onClick={moreOptionsCanv} style={{cursor: 'pointer',border: '1px solid #ccc', borderRadius: '15px',padding: '10px',bottom:'0', width:'90px'}}>
        <NavLink tag={ReactLink} style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' ,textAlign: 'center'}}>
        <h6>Meer <span style={{ display: 'block',}}>
          <TfiAngleDoubleLeft />
        </span></h6>
        </NavLink>
        </div>
        </div>)}
        {isArchivedPage && (<div style={{ width: '16%', minHeight: '100px',  }}>
  {/* Content goes here */}
</div>)}
        
      <div>
        <div style={{right:'0', marginRight:'30px'}}>
          <Collapse isOpen={isOpen} navbar>
            <Nav className="me-auto" navbar>
              {login && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <NavItem>
                    <NavLink tag={ReactLink} to="/user/dashboard">
                      {user.email}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink onClick={logout} tag={ReactLink} to="/">
                      Uitloggen
                    </NavLink>
                  </NavItem>
                  {user.depId === 1 && (
                    <NavItem>
                      <NavLink tag={ReactLink} to="/user/signup">
                        Registreren
                      </NavLink>
                    </NavItem>
                  )}
                </div>
              )}
            </Nav>
          </Collapse>
        </div>
      </div>

      <NavbarToggler onClick={() => setIsOpen(!isOpen)} />
    </Navbar>
  );
};

export default CustomNavbar;
