import React from 'react'
import { useEffect } from 'react'
import { useContext } from 'react'
import { useState } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter,Dropdown,DropdownToggle,DropdownItem,DropdownMenu } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch, faAdd, faSubtract } from '@fortawesome/free-solid-svg-icons';
import { getCurrentUserDetail, isLoggedIn } from '../auth'
import userContext from '../context/userContext'
import '../css/ordersStyle.css'
    function ArchivedOrders( {order, searchTerm} ) {
    const [uniqueUsers, setUniqueUsers] = useState([]);
    const userContextData = useContext(userContext)
    const [user, setUser] = useState(null)
    const [orderX, setOrderX] = useState(null)
    const [login, setLogin] = useState(null)
    const [filteredOrder, setFilteredOrder] = useState([order]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [itsOdanum, setItsOdanum] = useState(null);
    const [expandedRowIndex, setExpandedRowIndex] = useState(null);
    const [itsChecked, setItsChecked] = useState(false);
    const [theIndex, setTheIndex] = useState(null);
    const [checkedStates, setCheckedStates] = useState([]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [modal, setModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [sortedOrder, setSortedOrder] = useState(order);
    const [dropDownOpen, setDropdownOpen] = useState(false);

   

    useEffect(() => {
      setUser(getCurrentUserDetail())
      setLogin(isLoggedIn())
  }, [])
  
  useEffect(() => {
    if((searchTerm !== null)){
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      setFilteredOrder(
        order.filter((item) =>
        item.customerName.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.city.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.orderNumber.toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
    }
}, [searchTerm])

 // const toggleDropDown = () => setDropdownOpen((prevState) => !prevState);

 const toggleDropDown = () => {
    setDropdownOpen(!dropDownOpen);
  };
  useEffect(() => {
    setSelectedUsers([...uniqueUsers]);
  }, [uniqueUsers]);

  useEffect(() => {
    setUniqueUsers( [...new Set(order.map((item) => item.user))].sort());
}, [order])

useEffect(() => {
  setFilteredOrder(order.filter((item) => selectedUsers.includes(item.user)));
}, [selectedUsers])

    const handleCheckboxChange = (index,isChecked,odanum) => {
      setTheIndex(odanum);
      setItsChecked(isChecked);
      setItsOdanum(odanum);
      toggle();
    };

    const handleCheckboxClick = (event) => {
      event.stopPropagation();
      setSelectedUsers((prevSelectedUsers) => {
        if (event.target.value === 'selectAll') {
          return event.target.checked ? [...uniqueUsers] : [];
        } else {
          return event.target.checked
            ? [...prevSelectedUsers, event.target.value]
            : prevSelectedUsers.filter((selectedUser) => selectedUser !== event.target.value);
        }
      });
      setFilteredOrder(order.filter((item) => selectedUsers.includes(item.user)));
    };
  
    const renderBackorderColumn = (value, odanum, index) => {
      const isChecked = checkedStates[odanum] || false;
      if (value === '' || value === null || value === 'O') {
        return (<input type="checkbox" style={{ width: '25px', height: '25px' }} color="primary" checked={isChecked} onChange={() => handleCheckboxChange(index,isChecked,odanum)}/>);
      } else {
        return (<input type="checkbox" style={{ width: '25px', height: '25px' }} color="primary" checked={isChecked} onChange={() => handleCheckboxChange(index,isChecked,odanum)}/>);
      }
    };

    const toggle = (val) => {

      setModal(!modal);
      if(val === "yes"){
      const newCheckedStates = [...checkedStates];
      newCheckedStates[theIndex] = !newCheckedStates[theIndex];
      setCheckedStates(newCheckedStates);
      }else if (val === "no"){

      }
    }
    const getColorDot = (oNum, value, oId, dep) => {
      const orderDep = order.find((item) => item.id === oId);

      const tempList = order.filter((item) => item.orderNumber === oNum);
  
      const tempColor = tempList?.map((val) => {
        return val[dep];
      });

      tempColor?.map((val) => {
        if (val === "B") {
          return "B";
        } else if (val === "R") {
          return "R";
        } else if (val === "Y") {
          return "Y";
        } else if (val === "G") {
          return "G";
        } else {
          return val;
        }
      });
  
      const colorPriority = ["B", "R", "Y", "G"];
      const depColor =
        colorPriority?.find((color) => tempColor?.includes(color)) || "";
  
      switch (depColor) {
        case "R":
          return <div className="dot red"></div>;
        case "G":
          return <div className="dot green"></div>;
        case "Y":
          return <div className="dot yellow"></div>;
        case "B":
          return <div className="dot blue"></div>;
        default:
          return "";
      }
    };

    const getChildColorDot = (oNum, value, oId, dep) => {
      const orderDep = order.find((item) => item.id === oId);
          const depColor = orderDep[dep];
  
          switch (depColor) {
            case "R":
              return <div className="dot red"></div>;
            case "G":
              return <div className="dot green"></div>;
            case "Y":
              return <div className="dot yellow"></div>;
            case "B":
              return <div className="dot blue"></div>;
            default:
              return null;
          }
    };
  

    const handleRowClick = (index) => {
      if (expandedRowIndex === index) {
        setExpandedRowIndex(null);
      } else {
        setExpandedRowIndex(index);
      }
    };

    return (

<div className="table-container">
        <table>
        <thead>
          <tr>
            <th></th>
            <th>Verkooporder</th>
            <th>Ordersoort</th>
            <th>SME</th>
            <th>SPU</th>
            <th>MON LB</th>
            <th>MON TR</th>
            <th>MWE</th>
            <th>SER</th>
            <th>TRA</th>
            <th>EXP</th>
            <th>!</th>
            <th style={{overflow: 'hidden',}}>
              <Dropdown isOpen={dropDownOpen} toggle={toggleDropDown} >
              <DropdownToggle  data-toggle="dropdown"
    tag="span"> 
              Gebruiker (I)<FontAwesomeIcon icon={faFilter} />
    </DropdownToggle>
    <DropdownMenu container="body" style={{
  maxHeight: '200px',
  overflowY: 'auto'
}}>
  
    <DropdownItem >
                      <label>
                        <input type="checkbox" style={{ width: '22px', height: '22px' }} value = 'selectAll' onChange={(event) => handleCheckboxClick(event)} checked={selectedUsers.length === uniqueUsers.length} />{' '} -Select All/None
                      </label>
                    </DropdownItem>
                    <div style={{ borderTop: "1px dashed #ccc", margin: "0.5rem 0" }} /> 
                    {uniqueUsers.map((checkUser, index) => (<>
                   <DropdownItem key={index}>
                   <label>
                     <input type="checkbox" style={{ width: '22px', height: '22px' }} value={checkUser} onChange={(event) => handleCheckboxClick(event)} checked={selectedUsers.includes(checkUser)}/> -{' '}
                     {checkUser}
                   </label>
                 </DropdownItem>
                 <div style={{ borderTop: "1px dashed #ccc", margin: "0.5rem 0" }} /> </>
                  ))}
    </DropdownMenu>
  </Dropdown>
            </th>
            <th>Organisatie</th>
            <th>Naam</th>
            <th>Postcode</th>
            <th>Plaats</th>
            <th>Land</th>
            <th>Leverdatum</th>
            <th>Referentie</th>
            <th>Datum order</th>
            <th>Gebruiker (L)</th>
          </tr>
        </thead>
        <tbody>
        {filteredOrder
            ?.filter((item) => item.isParent === 1)
            .map((item, index) => (
              <React.Fragment key={`${item.id},${index}`}>
                {item.isParent === 1 && (
              <tr key={item.id}>
                

                <td style={{color:'light'}} onClick={() => handleRowClick(item.orderNumber)}>{expandedRowIndex === item.orderNumber ? <FontAwesomeIcon icon={faSubtract} /> : <FontAwesomeIcon icon={faAdd} />}</td>
                <td>{item.orderNumber}</td>
                <td>{item.orderType}</td>
                <td> {getColorDot(item.orderNumber, item?.sme, item.id, "sme")}</td>
                <td> {getColorDot(item.orderNumber, item?.spu, item.id, "spu")}</td>
                <td>{getColorDot(
                        item.orderNumber,
                        item.monLb,
                        item.id,
                        "monLb"
                      )}</td>
                <td>{getColorDot(
                        item.orderNumber,
                        item.monTr,
                        item.id,
                        "monTr"
                      )}</td>
               <td>
                      {getColorDot(item.orderNumber, item.mwe, item.id, "mwe")}
                    </td>
                    <td>
                      {getColorDot(item.orderNumber, item.ser, item.id, "ser")}
                    </td>
                    <td>
                      {getColorDot(item.orderNumber, item.tra, item.id, "tra")}
                    </td>
                    <td>
                      {getColorDot(item.orderNumber, item.exp, item.id, "exp")}
                    </td>
                <td>{getColorDot(item.exclamation)}</td>
                <td>{item.user}</td>
                <td>{item.organization}</td>
                <td>{item.customerName}</td>
                <td>{item.postCode}</td>
                <td>{item.city}</td>
                <td>{item.country}</td>
                <td>{item.deliveryDate}</td>
                <td>{item.referenceInfo}</td>
                <td>{item.creationDate}</td>
                <td>{item.verifierUser}</td>
              </tr> )}
              {expandedRowIndex === item.orderNumber && (
                item.isParent === 1 && (
                <tr>
                  
                  <td colSpan={22}>
                    <table>
                    
                      <thead>
                        <tr>
                          <th>Regel</th>
                          <th>SME</th>
                          <th>SPU</th>
                          <th>Aantal</th>
                          <th>Product</th>
                          <th>Omschrijving</th>
                          <th>Leverdatum</th>
                          <th>Gebruiker_I</th>
                          <th>MON LB</th>
                          <th>MON TR</th>
                          <th>MWE</th>
                        </tr>
                      </thead>
                      <tbody>

                      {filteredOrder.map(
                              (itemC, key) =>
                                item.orderNumber === itemC.orderNumber &&
                                item.isParent === 1 && (
                                  <tr
                                    key={`${itemC.orderNumber},${itemC.product}`}
                                  >
                <td>{itemC.regel}</td>
                <td>
                                      {getChildColorDot(
                                        itemC.orderNumber,
                                        itemC?.sme,
                                        itemC.id,
                                        "sme"
                                      )}
                                    </td>
                                    <td>
                                      {getChildColorDot(
                                        itemC.orderNumber,
                                        itemC?.spu,
                                        itemC.id,
                                        "spu"
                                      )}
                                    </td>
                <td>{itemC.aantal}</td>
                <td>{itemC.product}</td>
                <td>{itemC.omsumin}</td>
                <td>{itemC.deliveryDate}</td>
                <td>{itemC.user}</td>
                <td>
                                      {getChildColorDot(
                                        itemC.orderNumber,
                                        itemC.monLb,
                                        itemC.id,
                                        "monLb"
                                      )}
                                    </td>
                                    <td>
                                      {getChildColorDot(
                                        itemC.orderNumber,
                                        itemC.monTr,
                                        itemC.id,
                                        "monTr"
                                      )}
                                    </td>
                                    <td>
                                      {getChildColorDot(
                                        itemC.orderNumber,
                                        itemC.mwe,
                                        itemC.id,
                                        "mwe"
                                      )}
                                    </td>
                        </tr>
                         ))}
                        </tbody>
                    </table>
                  </td>
                </tr>
                )
              )}
              
            </React.Fragment>
            ))}
          </tbody>
      </table>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalBody style={{justifyContent: 'center'}}>
          Change Back Office Status for Order {itsOdanum}
        </ModalBody>
        <ModalFooter style={{justifyContent: 'center'}}>
          <Button color="primary" value="yes" onClick={(event) => toggle(event.target.value)}>
            Yes
          </Button>{' '}
          <Button color="secondary" value="no" onClick={(event) => toggle(event.target.value)}>
            No
          </Button>
        </ModalFooter>
      </Modal>

      </div>
    )
}

export default ArchivedOrders