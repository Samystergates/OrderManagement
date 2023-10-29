import React from "react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faAdd,
  faSubtract,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { getCurrentUserDetail, isLoggedIn } from "../auth";
import { updateOrders } from "../services/order-service";
import "../css/ordersStyle.css";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import NavCanv from "./NavCanv";
import SmeModal from "./SmeModal";
import SpuModal from "./SpuModal";
function Orders({
  order,
  searchTerm,
  isMoreOptionsCanv,
  moreOptionsCanv,
  toggleConfirmation,
  confirmationModal,
  reloadOrders,
  loadOrders,
}) {
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(null);
  const [filteredOrder, setFilteredOrder] = useState([order]);
  const [itsOdanum, setItsOdanum] = useState(null);
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [itsChecked, setItsChecked] = useState(false);
  const [itsIndex, setItsIndex] = useState(null);
  const [checkedStates, setCheckedStates] = useState([]);
  const [modal, setModal] = useState(false);
  const [spuPanelModal, setSpuPanelModal] = useState(false);
  const [smePanelModal, setSmePanelModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dropDownOpen, setDropdownOpen] = useState(false);
  const [rowDropDownOpen, setRowDropDownOpen] = useState([]);
  const [currSpu, setCurrSpu] = useState(null);
  const [currSme, setCurrSme] = useState(null);
  const [orderX, setOrderX] = useState([order]);
  const flowForward = useRef("FWD");
  const flowReverse = useRef("RVS");
  const flowHalt = useRef("HLT");
  const flowDepName = useRef(null);
  const StatusDepName = useRef(null);

  useEffect(() => {
    setUser(getCurrentUserDetail());
    setLogin(isLoggedIn());
  }, []);

  useEffect(() => {
    if (searchTerm !== null) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      setFilteredOrder(
        order?.filter(
          (item) =>
            item.customerName.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.city.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.orderNumber.toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
    }
  }, [searchTerm]);

  const toggleDropDown = () => setDropdownOpen((prevState) => !prevState);

  useEffect(() => {
    setUniqueUsers([...new Set(order?.map((item) => item.user))]?.sort());
    setOrderX(order);
  }, [order]);

  useEffect(() => {
    const newCheckedStates = [...checkedStates];
    orderX.forEach((item, index) => {
      if (item.backOrder === "B" && !newCheckedStates[item.orderNumber]) {
        newCheckedStates[item.orderNumber] =
          !newCheckedStates[item.orderNumber];
      }
    });
    setCheckedStates(newCheckedStates);
  }, [orderX]);

  useEffect(() => {
    setFilteredOrder(
      order?.filter((item) => selectedUsers.includes(item.user))
    );
  }, [selectedUsers]);

  useEffect(() => {
    setSelectedUsers([...uniqueUsers]);
  }, [uniqueUsers]);

  const updateForTra = (updatedTra) => {
    setOrderX(updatedTra);
  };

  const updatingOrdersBO = (flowUpdate, orderDto) => {
    updateOrders(flowUpdate, orderDto)
      .then((data) => {
        if (data.length > 0) {
        const newCheckedStates = [...checkedStates];
        newCheckedStates[itsOdanum] = !newCheckedStates[itsOdanum];
        setCheckedStates(newCheckedStates);

        const updatedOrderList = orderX.map((items) => {
          if (items.id === orderDto.id) {
            return {
              ...items,
              backOrder: itsChecked ? "O" : "B",
              Departments: data
                .filter((item) => item.id === orderDto.id)
                .map((item) => item.Departments),
            };
          }
          return items;
        });
        setOrderX(updatedOrderList);
        toast.success("BO Successfully Updated");
      }
      else {
        toast.error("Please Refresh, Empty List Received");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      })
      .catch((error) => {
        toast.error("Failed to Update, try logging in again" + error);
      });
  };

  const updatingOrdersColor = (flowUpdate, orderDto) => {
    updateOrders(flowUpdate, orderDto)
      .then((data) => {
        if (data.length > 0) {
        if (data) {
          if (orderX.length !== data.length) {
            setFilteredOrder(data);
            reloadOrders(data);
          }
          setOrderX(data);
          toast.success("Successfully Updated");
          return true;
        }
      }
      else {
        toast.error("Refreshing, Empty List Received");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      })
      .catch((error) => {
        toast.error("Failed to Update, try logging in again" + error);
        return false;
      });
  };

  const handleCheckboxChange = (index, isChecked, odanum) => {
    setItsIndex(index);
    setItsChecked(isChecked);
    setItsOdanum(odanum);
    toggle();
  };

  const handleCheckboxClick = (event) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (event.target.value === "selectAll") {
        return event.target.checked ? [...uniqueUsers] : [];
      } else {
        return event.target.checked
          ? [...prevSelectedUsers, event.target.value]
          : prevSelectedUsers.filter(
              (selectedUser) => selectedUser !== event.target.value
            );
      }
    });
    setFilteredOrder(order.filter((item) => selectedUsers.includes(item.user)));
  };

  const renderBackorderColumn = (value, odanum, index) => {
    const isChecked = checkedStates[odanum] || false;
    if (value === "" || value === null || value === "O") {
      return (
        <input
          type="checkbox"
          style={{ width: "24px", height: "24px" }}
          color="primary"
          checked={isChecked}
          onChange={() => handleCheckboxChange(index, isChecked, odanum)}
        />
      );
    } else {
      return (
        <input
          type="checkbox"
          style={{ width: "24px", height: "24px" }}
          color="primary"
          checked={isChecked}
          onChange={() => handleCheckboxChange(index, isChecked, odanum)}
        />
      );
    }
  };

  const toggle = (val) => {
    if (
      user.departmentsSet[0].depName === "ADMIN" ||
      user.departmentsSet[0].depName === "EXCBO"
    ) {
      setModal(!modal);
      if (val === "yes") {
        const orderForUpdate = orderX.find(
          (order) => order.orderNumber === itsOdanum && order.isParent === 1
        );
        const updatedOrderBO = {
          ...orderForUpdate,
          backOrder: itsChecked ? "O" : "B",
        };

        updatingOrdersBO(true, updatedOrderBO);
      } else if (val === "no") {
      }
    } else {
      toast.error("UnAuthorized Department");
    }
  };

  const initToggleFlow = (key, oId, dep, currStatus, flowVal) => {
    if (dep === "SME" && flowVal !== flowHalt.current && currStatus !== "B") {
      const orderForUpdate = orderX.find((item) => item.id === oId);
      const index = orderForUpdate?.departments?.findIndex(
        (entry) => entry.depName === dep
      );
      if (index !== -1) {
        const previousEntries = orderForUpdate?.departments?.slice(0, index);
        const nextEntries = orderForUpdate?.departments?.slice(index + 1);

        const isValidPrevious = previousEntries.every(
          (entry) =>
            entry.status === "G" ||
            entry.status === "" ||
            (entry.status === "B" && entry.depName === "SPU")
        );
        const isValidNext = nextEntries.every(
          (entry) =>
            entry.status === "R" || entry.status === "" || entry.status === "B"
        );

        if ((isValidNext && isValidPrevious)) {
          toggleSmeFlowMod(key, oId, dep, currStatus);
        } else {
          toast.error("Complete Previous");
          console.log("error");
        }
      }
    } else if (
      dep === "SPU" &&
      flowVal !== flowHalt.current &&
      currStatus !== "B"
    ) {
      const orderForUpdate = orderX.find((item) => item.id === oId);
      const index = orderForUpdate?.departments?.findIndex(
        (entry) => entry.depName === dep
      );
      if (index !== -1) {
        const previousEntries = orderForUpdate?.departments?.slice(0, index);
        const nextEntries = orderForUpdate?.departments?.slice(index + 1);

        const isValidPrevious = previousEntries.every(
          (entry) =>
            entry.status === "G" ||
            entry.status === "" ||
            (entry.status === "R" && entry.depName === "SME" && currStatus === "")
        );
        const isValidNext = nextEntries.every(
          (entry) =>
            entry.status === "R" || entry.status === "" || entry.status === "B"
        );

        if ((isValidNext && isValidPrevious)) {
          toggleSpuFlowMod(key, oId, dep, currStatus);
        } else {
          toast.error("Complete Previous");
          console.log("error");
        }
      }
    } else {
      toggleFlow(key, oId, dep, currStatus, flowVal);
    }
  };

  const toggleFlowTra = (key, oId, dep, currStatus, flowVal) => {
    const keyArray = key.split(",").map((id) => parseInt(id.trim(), 10));
    const updatedOrderList = orderX.map((items) => {
      if (keyArray.includes(items.id)) {
        const updatedDepartments = items.departments.map((val) => {
          if (val.depName === dep) {
            return {
              ...val,
              prevStatus: currStatus,
              status:
                currStatus === "R" && flowVal === flowForward.current
                  ? "Y"
                  : currStatus === "Y" && flowVal === flowForward.current
                  ? "G"
                  : flowVal === flowHalt.current
                  ? "B"
                  : currStatus === "B" && flowVal === flowReverse.current
                  ? val.prevStatus
                  : currStatus,
            };
          } else {
            return val;
          }
        });
        return {
          ...items,
          tra: updatedDepartments.find((val) => val.depName === dep)?.status,
          departments: updatedDepartments,
        };
      }
      return items;
    });
    const flattenedUpdatedOrderList = [].concat(...updatedOrderList);
    const areAllDepartmentsG = keyArray.every((orderId) => {
      const order = flattenedUpdatedOrderList.find(
        (item) => item.id === orderId
      );
      if (order) {
        return order.departments.every(
          (department) => department.status === "G" || department.status === ""
        );
      }
      return false;
    });

    if (areAllDepartmentsG) {
      const updatedOrderListWithoutKeyArray = flattenedUpdatedOrderList.filter(
        (order) => !keyArray.includes(order.id)
      );
      setOrderX(updatedOrderListWithoutKeyArray);
      setFilteredOrder(updatedOrderListWithoutKeyArray);
      reloadOrders(updatedOrderListWithoutKeyArray);
    } else {
      setOrderX(flattenedUpdatedOrderList);
    }
  };

  const toggleBOFlow = (onum, opd, dep, currStatus, flowVal) => {
    const updatedOrderList = orderX.map((items) => {
      if (items.orderNumber === onum && items.product === opd) {
        return {
          ...items,
          exclamation: currStatus,
        };
      }
      return items;
    });

    updatingOrdersColor(
      true,
      updatedOrderList.find(
        (item) => item.orderNumber === onum && item.product === opd
      )
    );
  };

  const toggleFlow = (key, oId, dep, currStatus, flowVal) => {
    const orderForUpdate = orderX.find((item) => item.id === oId);
    const index = orderForUpdate?.departments?.findIndex(
      (entry) => entry.depName === dep
    );
    if (index !== -1) {
      const previousEntries = orderForUpdate?.departments?.slice(0, index);
      const nextEntries = orderForUpdate?.departments?.slice(index + 1);

      const isValidPrevious = previousEntries.every(
        (entry) =>
          entry.status === "G" ||
          entry.status === "" ||
          (entry.status === "R" && entry.depName === "SME" && dep === "SPU")
      );
      const isValidNext = nextEntries.every(
        (entry) =>
          entry.status === "R" || entry.status === "" || entry.status === "B"
      );
      if ((isValidNext && isValidPrevious) || currStatus === "B") {
        if (dep === "SME") {
          if (currStatus === "") {
            setCurrSme({ ...currSme, sme: "R" });
          }
          if (currStatus === "R") {
            setCurrSme({ ...currSme, sme: "Y" });
          }
          if (currStatus === "Y") {
            setCurrSme({ ...currSme, sme: "G" });
          }
        }

        if (dep === "SPU") {
          if (currStatus === "") {
            setCurrSpu({ ...currSpu, spu: "R" });
          }
          if (currStatus === "R") {
            setCurrSpu({ ...currSpu, spu: "Y" });
          }
          if (currStatus === "Y") {
            setCurrSpu({ ...currSpu, spu: "G" });
          }
        }
        flowDepName.current = dep.toLowerCase();
        if (dep.length === 5) {
          flowDepName.current =
            flowDepName.current.substr(0, 3) +
            flowDepName.current.charAt(3).toUpperCase() +
            flowDepName.current.substr(4);
        }

        const updatedOrderList = orderX.map((items) => {
          if (items.id === oId) {
            const updatedDepartments = items.departments.map((val) => {
              if (val.depName === dep) {
                return {
                  ...val,
                  status:
                    currStatus === "" && flowVal === flowForward.current
                      ? "R"
                      : currStatus === "R" && flowVal === flowForward.current
                      ? "Y"
                      : currStatus === "Y" && flowVal === flowForward.current
                      ? "G"
                      : currStatus === "R" &&
                        flowVal === flowReverse.current &&
                        (dep === "SME" || dep === "SPU")
                      ? ""
                      : flowVal === flowHalt.current
                      ? "B"
                      : currStatus === "B" && flowVal === flowReverse.current
                      ? val.prevStatus
                      : currStatus,
                  prevStatus: currStatus,
                };
              } else {
                return val;
              }
            });

            return {
              ...items,
              [flowDepName.current]: updatedDepartments.find(
                (val) => val.depName === dep
              )?.status,
              departments: updatedDepartments,
            };
          }

          return items;
        });

        updatingOrdersColor(
          true,
          updatedOrderList.find((item) => item.id === oId)
        );
      } else {
        toast.error("Complete Previous");
        console.log("error");
      }
    } else {
      console.log("dep not found in departments");
    }
  };

  const toggleSmeFlowMod = (key, oId, dep, currStatus) => {
    setSmePanelModal(!smePanelModal);
    const foundObject = orderX.find((item) => item.id === oId);
    setCurrSme(foundObject);
  };

  const toggleSpuFlowMod = (key, oId, dep, currStatus) => {
    setSpuPanelModal(!spuPanelModal);
    const foundObject = orderX.find((item) => item.id === oId);
    setCurrSpu(foundObject);
  };

  const getColorDot = (oNum, value, oId, dep) => {
    const orderDep = orderX.find((item) => item.id === oId);
    // const depColor = orderDep[dep];

    const tempList = orderX.filter((item) => item.orderNumber === oNum);

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
    const orderDep = orderX.find((item) => item.id === oId);
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

  const handleRowClick = (ordernNum) => {
    if (expandedRowIndex === ordernNum) {
      setExpandedRowIndex(null);
    } else {
      setExpandedRowIndex(ordernNum);
    }
  };

  const handleColClick = (productNum) => {
    setRowDropDownOpen((prevState) => {
      const updatedState = [...prevState];
      updatedState[productNum] = !prevState[productNum];
      return updatedState;
    });
  };

  const orderDepON = (onum) => {
    return orderX.find(
      (item) => item.orderNumber === onum && item.isParent === 1
    );
  };

  const renderDropdownItems = (dep, oId, oNm, key, currStatus) => {
    if (
      user.departmentsSet[0].depName === "ADMIN" ||
      user.departmentsSet[0].depName === dep
    ) {
      const orderDep = orderX.find((item) => item.id === oId);
      StatusDepName.current = dep?.toLowerCase();
      if (dep?.length === 5) {
        StatusDepName.current =
          StatusDepName.current.substr(0, 3) +
          StatusDepName.current.charAt(3).toUpperCase() +
          StatusDepName.current.substr(4);
      }
      const statusCode = orderDep?.[StatusDepName.current];

      if (checkedStates[oNm]) {
        return (
          <DropdownItem
            className="DropDown-Size"
            style={{ color: "#ccc", pointerEvents: "none" }}
            onClick={() => initToggleFlow(key, oId, dep, StatusDepName.current)}
          >
            <li
              style={{
                pointerEvents: "none",
                borderBottom: "2px solid #ccc",
                padding: "8px 0",
              }}
            >
              Setup {dep}
            </li>
          </DropdownItem>
        );
      }
      if (statusCode === "") {
        return (
          <>
            <DropdownItem
              className="DropDown-Size"
              //  onClick={() => toggleFlow(key, oId, dep, statusCode, flowForward)}
              onClick={() =>
                initToggleFlow(key, oId, dep, statusCode, flowForward.current)
              }
            >
              <li style={{ borderBottom: "2px solid #ccc", padding: "8px 0" }}>
                Setup {dep}
              </li>
            </DropdownItem>
            <DropdownItem
              className="DropDown-Size"
              onClick={() =>
                initToggleFlow(key, oId, dep, statusCode, flowHalt.current)
              }
            >
              <li style={{ borderBottom: "2px solid #ccc", padding: "8px 0" }}>
                Mark {dep} N/A
              </li>
            </DropdownItem>
          </>
        );
      }
      if (statusCode === "R") {
        return (
          <>
            <DropdownItem
              className="DropDown-Size"
              onClick={() =>
                initToggleFlow(key, oId, dep, statusCode, flowForward.current)
              }
            >
              <li style={{ borderBottom: "2px solid #ccc", padding: "8px 0" }}>
                Start {dep}
              </li>
            </DropdownItem>
            <DropdownItem
              className="DropDown-Size"
              onClick={() =>
                initToggleFlow(key, oId, dep, statusCode, flowHalt.current)
              }
            >
              <li style={{ borderBottom: "2px solid #ccc", padding: "8px 0" }}>
                Mark {dep} N/A
              </li>
            </DropdownItem>
          </>
        );
      }
      if (statusCode === "Y") {
        return (
          <>
            <DropdownItem
              className="DropDown-Size"
              onClick={() =>
                initToggleFlow(key, oId, dep, statusCode, flowForward.current)
              }
            >
              <li style={{ borderBottom: "2px solid #ccc", padding: "8px 0" }}>
                Finish {dep}
              </li>
            </DropdownItem>
          </>
        );
      }
      if (statusCode === "G") {
        return (
          <>
            <DropdownItem
              className="DropDown-Size"
              style={{ color: "#ccc", pointerEvents: "none" }}
            >
              <li
                style={{
                  pointerEvents: "none",
                  borderBottom: "2px solid #ccc",
                  padding: "8px 0",
                }}
              >
                Completed {dep}
              </li>
            </DropdownItem>
          </>
        );
      }
      if (statusCode === "B") {
        return (
          <>
            <DropdownItem
              className="DropDown-Size"
              onClick={() =>
                initToggleFlow(key, oId, dep, statusCode, flowReverse.current)
              }
            >
              <li style={{ borderBottom: "2px solid #ccc", padding: "8px 0" }}>
                Mark {dep} Available
              </li>
            </DropdownItem>
          </>
        );
      }
    }
    return null;
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Verkooporder</th>
            <th>Ordersoort</th>
            <th>Backorder</th>
            <th>SME</th>
            <th>SPU</th>
            <th>MON LB</th>
            <th>MON TR</th>
            <th>MWE</th>
            <th>SER</th>
            <th>TRA</th>
            <th>EXP</th>
            <th>!</th>
            <th style={{ overflow: "hidden" }}>
              <Dropdown isOpen={dropDownOpen} toggle={toggleDropDown}>
                <DropdownToggle data-toggle="dropdown" tag="span">
                  Gebruiker (I)
                  <FontAwesomeIcon icon={faFilter} />
                </DropdownToggle>
                <DropdownMenu
                  container="body"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  <DropdownItem>
                    <label>
                      <input
                        type="checkbox"
                        style={{ width: "18px", height: "18px" }}
                        value="selectAll"
                        onChange={(event) => handleCheckboxClick(event)}
                        checked={selectedUsers.length === uniqueUsers.length}
                      />{" "}
                      - Select All/None
                    </label>
                  </DropdownItem>
                  <div
                    style={{ borderTop: "1px dashed #ccc", margin: "0.5rem 0" }}
                  />
                  {uniqueUsers.map((checkUser, index) => (
                    <>
                      <DropdownItem key={index}>
                        <label>
                          <input
                            type="checkbox"
                            style={{ width: "18px", height: "18px" }}
                            value={checkUser}
                            onChange={(event) => handleCheckboxClick(event)}
                            checked={selectedUsers.includes(checkUser)}
                          />{" "}
                          - {checkUser}
                        </label>
                      </DropdownItem>
                      <div
                        style={{
                          borderTop: "1px dashed #ccc",
                          margin: "0.5rem 0",
                        }}
                      />
                    </>
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
                  <tr>
                    <td
                      style={{ color: "light" }}
                      onClick={(e) => {
                        handleRowClick(item.orderNumber);
                        e.stopPropagation();
                      }}
                    >
                      {expandedRowIndex === item.orderNumber ? (
                        <FontAwesomeIcon icon={faSubtract} />
                      ) : (
                        <FontAwesomeIcon icon={faAdd} />
                      )}
                    </td>
                    <td>{item.orderNumber}</td>
                    <td>{item.orderType}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {renderBackorderColumn(
                        item.backOrder,
                        item.orderNumber,
                        item.id
                      )}
                    </td>
                    <td>
                      {getColorDot(item.orderNumber, item?.sme, item.id, "sme")}
                    </td>
                    <td>
                      {getColorDot(item.orderNumber, item?.spu, item.id, "spu")}
                    </td>
                    <td>
                      {getColorDot(
                        item.orderNumber,
                        item.monLb,
                        item.id,
                        "monLb"
                      )}
                    </td>
                    <td>
                      {getColorDot(
                        item.orderNumber,
                        item.monTr,
                        item.id,
                        "monTr"
                      )}
                    </td>
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
                    <td>
                      {orderX.find(
                        (entry) =>
                          entry.orderNumber === item.orderNumber &&
                          entry.product === item.product
                      )?.exclamation === "JA" && (
                        <div
                          style={{ color: "yellow", display: "inline-block" }}
                        >
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            style={{
                              fontSize: "1.3em",
                              color: "black",
                            }}
                          />
                        </div>
                      )}
                    </td>
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
                  </tr>
                )}

                {expandedRowIndex === item.orderNumber &&
                  item.isParent === 1 && (
                    <tr>
                      <td className="inner-td" colSpan={22}>
                        <table>
                          <thead>
                            <tr>
                              <th>Regel</th>
                              <th>BO</th>
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
                              <th>SER</th>
                              <th>TRA</th>
                              <th>EXP</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrder.map(
                              (itemC, key) =>
                                item.orderNumber === itemC.orderNumber &&
                                item.isParent === 1 && (
                                  <tr
                                    key={`${itemC.orderNumber},${itemC.product}`}
                                    onClick={(e) => {
                                      handleColClick(itemC.product);
                                      e.stopPropagation();
                                    }}
                                  >
                                    <td>{itemC.regel}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                      {renderBackorderColumn(
                                        itemC.backOrder,
                                        itemC.orderNumber,
                                        itemC.id
                                      )}
                                    </td>
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
                                    <td>
                                      <Dropdown
                                        isOpen={rowDropDownOpen[itemC.product]}
                                        toggle={() => {
                                          handleColClick(itemC.product);
                                        }}
                                      >
                                        <DropdownToggle
                                          data-toggle="dropdown"
                                          tag="span"
                                        >
                                          {itemC.aantal}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                          <DropdownItem
                                            header
                                            style={{
                                              fontWeight: "bold",
                                              fontSize: "large",
                                            }}
                                            className="dropdown-header"
                                          >
                                            Order: {itemC.orderNumber},{" "}
                                            {itemC.product}
                                          </DropdownItem>
                                          {renderDropdownItems(
                                            "SME",
                                            itemC.id,
                                            itemC.orderNumber,
                                            `${itemC.orderNumber},${itemC.product}`,
                                            itemC?.sme
                                          )}
                                          {renderDropdownItems(
                                            "SPU",
                                            itemC.id,
                                            itemC.orderNumber,
                                            `${itemC.orderNumber},${itemC.product}`,
                                            itemC?.spu
                                          )}

                                          {item.orderType === "LAS" &&
                                            renderDropdownItems(
                                              "EXP",
                                              itemC.id,
                                              itemC.orderNumber,
                                              `${itemC.orderNumber},${itemC.product}`,
                                              itemC.exp
                                            )}
                                          {item.orderType === "LSO" &&
                                            renderDropdownItems(
                                              "SER",
                                              itemC.id,
                                              itemC.orderNumber,
                                              `${itemC.orderNumber},${itemC.product}`,
                                              itemC.ser
                                            )}
                                          {item.orderType === "MAO" && (
                                            <>
                                              {renderDropdownItems(
                                                "MONLB",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.monLb
                                              )}
                                              {renderDropdownItems(
                                                "EXP",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.exp
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "MLO" && (
                                            <>
                                              {" "}
                                              {renderDropdownItems(
                                                "MONLB",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.monLb
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "MWO" && (
                                            <>
                                              {renderDropdownItems(
                                                "MWE",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.mwe
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "MSO" && (
                                            <>
                                              {renderDropdownItems(
                                                "MONLB",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.monLb
                                              )}
                                              {renderDropdownItems(
                                                "SER",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.ser
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "MLT" && (
                                            <>
                                              {renderDropdownItems(
                                                "MONTR",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.monTr
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "MST" && (
                                            <>
                                              {renderDropdownItems(
                                                "MONTR",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.monTr
                                              )}
                                              {renderDropdownItems(
                                                "SER",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.ser
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "LAP" && (
                                            <>
                                              {renderDropdownItems(
                                                "EXP",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.exp
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "LSP" &&
                                            renderDropdownItems(
                                              "SER",
                                              itemC.id,
                                              itemC.orderNumber,
                                              `${itemC.orderNumber},${itemC.product}`,
                                              itemC.ser
                                            )}
                                          {item.orderType === "MAP" && (
                                            <>
                                              {renderDropdownItems(
                                                "MONLB",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.monLb
                                              )}
                                              {renderDropdownItems(
                                                "EXP",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.exp
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "MLP" && (
                                            <>
                                              {renderDropdownItems(
                                                "MONLB",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.monLb
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "MWP" && (
                                            <>
                                              {renderDropdownItems(
                                                "MWE",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.mwe
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "MSP" && (
                                            <>
                                              {renderDropdownItems(
                                                "MONLB",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.monLb
                                              )}
                                              {renderDropdownItems(
                                                "SER",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.ser
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "MSE" && (
                                            <>
                                              {renderDropdownItems(
                                                "MONTR",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.monTr
                                              )}
                                              {renderDropdownItems(
                                                "SER",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.ser
                                              )}
                                            </>
                                          )}
                                          {item.orderType === "MLE" && (
                                            <>
                                              {renderDropdownItems(
                                                "MONTR",
                                                itemC.id,
                                                itemC.orderNumber,
                                                `${itemC.orderNumber},${itemC.product}`,
                                                itemC.monTr
                                              )}
                                            </>
                                          )}
                                          {((orderDepON(item.orderNumber)
                                            ?.exclamation === "" ||
                                            orderDepON(item.orderNumber)
                                              ?.exclamation === null ||
                                            orderDepON(item.orderNumber)
                                              ?.exclamation === "NEE")) && (user.departmentsSet[0].depName === "ADMIN" ||
                                              user.departmentsSet[0].depName === "EXCBO") && (
                                            <DropdownItem
                                              className="DropDown-Size"
                                              onClick={() =>
                                                toggleBOFlow(
                                                  item.orderNumber,
                                                  item.product,
                                                  "EXCBO",
                                                  "JA",
                                                  flowForward
                                                )
                                              }
                                            >
                                              <li
                                                style={{
                                                  borderBottom:
                                                    "2px solid #ccc",
                                                  padding: "8px 0",
                                                }}
                                              >
                                                BO Mark
                                              </li>
                                            </DropdownItem>
                                          )}

                                          {(orderDepON(item.orderNumber)
                                            ?.exclamation === "JA" ) && (user.departmentsSet[0].depName === "ADMIN" ||
                                            user.departmentsSet[0].depName === "EXCBO") && (
                                            <DropdownItem
                                              className="DropDown-Size"
                                              onClick={() =>
                                                toggleBOFlow(
                                                  item.orderNumber,
                                                  item.product,
                                                  "EXCBO",
                                                  "NEE",
                                                  flowReverse
                                                )
                                              }
                                            >
                                              <li
                                                style={{
                                                  borderBottom:
                                                    "2px solid #ccc",
                                                  padding: "8px 0",
                                                }}
                                              >
                                                BO UnMark
                                              </li>
                                            </DropdownItem>
                                          )}
                                        </DropdownMenu>
                                      </Dropdown>
                                    </td>
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
                                    <td>
                                      {getChildColorDot(
                                        itemC.orderNumber,
                                        itemC.ser,
                                        itemC.id,
                                        "ser"
                                      )}
                                    </td>
                                    <td>
                                      {getChildColorDot(
                                        itemC.orderNumber,
                                        itemC.tra,
                                        itemC.id,
                                        "tra"
                                      )}
                                    </td>
                                    <td>
                                      {getChildColorDot(
                                        itemC.orderNumber,
                                        itemC.exp,
                                        itemC.id,
                                        "exp"
                                      )}
                                    </td>
                                  </tr>
                                )
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
              </React.Fragment>
            ))}
        </tbody>
      </table>

      <Modal isOpen={modal} toggle={toggle}>
        <ModalBody style={{ justifyContent: "center" }}>
          Change Back Office Status for Order {itsOdanum}
        </ModalBody>
        <ModalFooter style={{ justifyContent: "center" }}>
          <Button
            color="primary"
            value="yes"
            onClick={(event) => toggle(event.target.value)}
          >
            Yes
          </Button>{" "}
          <Button
            color="secondary"
            value="no"
            onClick={(event) => toggle(event.target.value)}
          >
            No
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={confirmationModal} toggle={toggleConfirmation}>
        <ModalBody style={{ justifyContent: "center" }}>
          Start CRM Orders Fetching Process?
        </ModalBody>
        <ModalFooter style={{ justifyContent: "center" }}>
          <Button
            color="primary"
            value="yes"
            onClick={(event) => toggleConfirmation(event.target.value)}
          >
            Yes
          </Button>{" "}
          <Button
            color="secondary"
            value="no"
            onClick={(event) => toggleConfirmation(event.target.value)}
          >
            No
          </Button>
        </ModalFooter>
      </Modal>

      <SmeModal
        smePanelModal={smePanelModal}
        toggleSmeFlowMod={toggleSmeFlowMod}
        currSme={currSme}
        toggleFlow={toggleFlow}
      />

      <SpuModal
        spuPanelModal={spuPanelModal}
        toggleSpuFlowMod={toggleSpuFlowMod}
        currSpu={currSpu}
        toggleFlow={toggleFlow}
      />

      <NavCanv
        isMoreOptionsCanv={isMoreOptionsCanv}
        moreOptionsCanv={moreOptionsCanv}
        updateForTra={updateForTra}
        orderX={orderX}
        toggleFlowTra={toggleFlowTra}
      />
    </div>
  );
}

export default Orders;
