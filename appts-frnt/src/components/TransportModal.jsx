import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGreaterThan, faLessThan } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { toast } from "react-toastify";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { getCurrentUserDetail, isLoggedIn } from "../auth";
import {
  loadAllRoutes,
  loadAllDrivers,
  loadAllTrucks,
  loadAllTrailers,
  loadAllTraOrders,
  loadTra,
  saveTra,
  updateTra,
  deleteTra,
  updateTraColors,
} from "../services/transportOrder-service";
import DatePicker from "react-datepicker";

function TransportModal({
  transportPanelModal,
  toggleTraFlowMod,
  updateForTra,
  orderX,
  orderY,
  toggleFlowTra,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drivers, setDrivers] = useState(null);
  const [loadedEntry, setLoadedEntry] = useState(false);
  const [unloadedEntry, setUnloadedEntry] = useState(true);
  const [trucks, setTrucks] = useState(null);
  const [trailers, setTrailers] = useState(null);
  const [tempOrders, setTempOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrder, setFilteredOrder] = useState([]);
  const [traOrders, setTraOrders] = useState([orderY]);
  const [routeOrders, setRouteOrders] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRouteRowId, setSelectedRouteRowId] = useState(null);
  const [entry, setEntry] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [initTraOrders, setInitTraOrders] = useState(false);
  const [colorValue, setColorValue] = useState(null);

  useEffect(() => {
    if (selectedRouteRowId !== null) {
      const selectedEntry = routeOrders?.find(
        (item) => item?.order?.id === selectedRouteRowId
      );
      setEntry(selectedEntry?.order);
      const selectedIds = selectedEntry?.order?.orderIds;
      const filteredTraOrders = orderY?.filter((order) => {
        const selectedIdsArray = selectedIds?.split(",").map((id) => id.trim());
        return selectedIdsArray.includes(String(order?.id));
      });
      setTempOrders(filteredTraOrders);

      setSelectedDate(new Date(selectedEntry?.order?.routeDate));
      setLoadedEntry(!loadedEntry);
      setUnloadedEntry(false);
    }
  }, [selectedRouteRowId]);

  useEffect(() => {
    const hasAllTRAValuesR = tempOrders?.every((order) =>
      ["R"].includes(order.tra)
    );
    const hasAllTRAValuesY = tempOrders?.every((order) =>
      ["Y"].includes(order.tra)
    );
    const hasAllTRAValuesG = tempOrders?.every((order) =>
      ["G"].includes(order.tra)
    );
    const isTempOrdersEmpty = !tempOrders || tempOrders.length === 0;

    if (hasAllTRAValuesR) {
      setColorValue("R");
    }
    if (hasAllTRAValuesY) {
      setColorValue("Y");
    }
    if (hasAllTRAValuesG) {
      setColorValue("G");
    }
    if (isTempOrdersEmpty) {
      setColorValue("N");
    }
  }, [tempOrders]);


  useEffect(() => {
    if (transportPanelModal) {
      setSelectedDate(getNextWorkingDay());
      setEntry({ ...entry, routeDate: getNextWorkingDay() });
      loadAllRouteOrders();
      setLoadedEntry(!loadedEntry);
    }
  }, [transportPanelModal]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setUser(getCurrentUserDetail());
        setLogin(isLoggedIn());

        loadAllRoutes()
          .then((data) => {
            setRoutes([...data]);
            if (data !== null) {
            } else {
            }
          })
          .catch((error) => {
            console.log(error);
          });

        loadAllDrivers()
          .then((data) => {
            setDrivers([...data]);
            if (data !== null) {
            } else {
            }
          })
          .catch((error) => {
            console.log(error);
          });

        loadAllTrucks()
          .then((data) => {
            setTrucks([...data]);
            if (data !== null) {
            } else {
            }
          })
          .catch((error) => {
            console.log(error);
          });

        loadAllTrailers()
          .then((data) => {
            setTrailers([...data]);
            if (data !== null) {
            } else {
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const tempTraOrders = orderY?.filter(
      (item) => item.tra !== null && item.tra !== ""
    );
    const concatenatedOrderIds = routeOrders
      ? Array.from(routeOrders?.values())
          .map((value) => value?.order?.orderIds)
          .join(",")
      : "";

    const filteredTraOrders = tempTraOrders?.filter(
      (order) => !concatenatedOrderIds.includes(order?.id)
    );
    setTraOrders(filteredTraOrders);
    setInitTraOrders(!initTraOrders);
  }, [routeOrders, loadedEntry]);

  useEffect(() => {
    setFilteredOrder(traOrders);
  }, [routeOrders, loadedEntry, initTraOrders]);

  useEffect(() => {
    if (searchTerm !== null) {
      setFilteredOrder(
        traOrders?.filter((item) =>
          item?.orderNumber
            ?.toLowerCase()
            ?.startsWith(searchTerm?.toLowerCase())
        )
      );
    }
  }, [searchTerm]);

  useEffect(() => {
    const updatedOrderIds = tempOrders?.map((order) => order?.id).join(",");
    setEntry((prevEntry) => ({
      ...prevEntry,
      orderIds: updatedOrderIds,
    }));
  }, [tempOrders]);

  const handleModalClosed = () => {
    clearData();
  };

  function loadAllRouteOrders() {
    loadAllTraOrders()
      .then((data) => {
        const routeOrdersArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          order: value,
        }));
        setRouteOrders(routeOrdersArray);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function saveOrderTra() {
    if (!entry?.route) {
      toast.error("route required");
      return;
    }
    if (!entry?.routeDate) {
      toast.error("route date required");
      return;
    }
    saveTra(entry)
      .then((data) => {
        setEntry(data);
        loadAllRouteOrders();
        setUnloadedEntry(false);
        toast.success("Saved Successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function updateOrderTra() {
    if (!entry?.route) {
      toast.error("route required");
      return;
    }
    if (!entry?.routeDate) {
      toast.error("route date required");
      return;
    }
    updateTra(entry)
      .then((data) => {
        setEntry(data);
        loadAllRouteOrders();
        toast.success("Updated Successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function deleteOrderTra() {
    if (!entry?.route) {
      toast.error("route required");
      return;
    }
    if (!entry?.routeDate) {
      toast.error("route date required");
      return;
    }
    deleteTra(entry?.id)
      .then((data) => {
        toast.success("Removed Successfully");
        toggleTraFlowMod();
      })
      .catch((error) => {
        toast.error("Error, Try Logging in again", error);
        console.log(error);
      });
  }

  const toggleConfirmation = (val) => {
    if (user.departmentsSet[0].depName === "ADMIN") {
      setConfirmationModal(!confirmationModal);
      if (val === "yes") {
        deleteOrderTra();
      } else if (val === "no") {
      }
    } else {
      toast.error("UnAuthorized Department");
    }
  };

  const startTraOrders = async () => {
    const tempRelatedItensArray = tempOrders.flatMap((order) => {
      const correspondingOrderXArray = orderX.filter(
        (orderXItem) => orderXItem.orderNumber === order.orderNumber
      );
      return correspondingOrderXArray;
    });

    const valid = tempRelatedItensArray.every((order) => {
      const traIndex = order.departments.findIndex(
        (entry) => entry.depName === "TRA"
      );

      if (traIndex !== -1) {
        const previousEntries = order.departments.slice(0, traIndex);
        const nextEntries = order.departments.slice(traIndex + 1);

        const isValidPrevious = previousEntries.every(
          (entry) => entry.status === "G" || entry.status === ""
        );
        const isValidNext = nextEntries.every(
          (entry) =>
            entry.status === "R" || entry.status === "" || entry.status === "B"
        );

        if (isValidPrevious && isValidNext) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });

    if (valid) {
      const idsArray = tempOrders
        .map((order) => {
          const correspondingOrderXArray = orderX.filter(
            (orderXItem) => orderXItem.orderNumber === order.orderNumber
          );
          const correspondingIds = correspondingOrderXArray.map(
            (orderXItem) => orderXItem.id
          );

          return correspondingIds.length > 0 ? correspondingIds : null;
        })
        .filter((ids) => ids !== null);

      const idsString = idsArray.flat().join(",");
      updateTraColorsFuncY(idsString);
    } else {
      toast.error("Complete Previous");
    }
  };

  const finishTraOrders = () => {
    const tempRelatedItensArray = tempOrders.flatMap((order) => {
      const correspondingOrderXArray = orderX.filter(
        (orderXItem) => orderXItem.orderNumber === order.orderNumber
      );
      return correspondingOrderXArray;
    });

    const valid = tempRelatedItensArray.every((order) => {
      const traIndex = order.departments.findIndex(
        (entry) => entry.depName === "TRA"
      );

      if (traIndex !== -1) {
        const previousEntries = order.departments.slice(0, traIndex);
        const nextEntries = order.departments.slice(traIndex + 1);
        const isValidPrevious = previousEntries.every(
          (entry) => entry.status === "G" || entry.status === ""
        );

        const isValidNext = nextEntries.every(
          (entry) =>
            entry.status === "R" || entry.status === "" || entry.status === "B"
        );

        if (isValidPrevious && isValidNext) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
    if (valid) {
      const idsArray = tempOrders
        .map((order) => {
          const correspondingOrderXArray = orderX.filter(
            (orderXItem) => orderXItem.orderNumber === order.orderNumber
          );
          const correspondingIds = correspondingOrderXArray.map(
            (orderXItem) => orderXItem.id
          );

          return correspondingIds.length > 0 ? correspondingIds : null;
        })
        .filter((ids) => ids !== null);

      const idsString = idsArray.flat().join(",");
      updateTraColorsFuncG(idsString);
    } else {
      toast.error("Complete Previous");
    }
  };

  const updateTraColorsFuncY = (idsString) => {
    updateTraColors(idsString, 0)
      .then((data) => {
        if (data) {
          const updatedTempOrders = tempOrders.map((order) => ({
            ...order,
            tra: "Y",
          }));

          setTempOrders(updatedTempOrders);
          toggleFlowTra(idsString, 0, "TRA", "R", "FWD");

          toast.success("Successfully Updated");
        } else {
          toast.error("Can't Proceed");
        }
      })
      .catch((error) => {
        toast.error("Can't Proceed, Try Loging in Again");
      });
  };

  const updateTraColorsFuncG = async (idsString) => {
    updateTraColors(idsString, entry?.id)
      .then((data) => {
        if (data) {
          const updatedTempOrders = tempOrders.map((order) => ({
            ...order,
            tra: "G",
          }));
          setTempOrders(updatedTempOrders);

          toggleFlowTra(idsString, 0, "TRA", "Y", "FWD");
          deleteOrderTra(entry?.id);
          loadAllRouteOrders();
          toast.success("Successfully Updated");
        } else {
          toast.error("Can't Proceed");
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Can't Proceed, Try Loging in Again");
      });
  };

  const moveOrderToRight = () => {
    if (selectedRow && !tempOrders?.includes(selectedRow)) {
      const updatedTempTraOrder = filteredOrder.filter(
        (item) => item?.id !== selectedRow?.id
      );
      const updatedTempTraOrder2 = traOrders.filter(
        (item) => item?.id !== selectedRow?.id
      );
      setTempOrders((prevTempOrders) => {
        const newTempOrders = Array.isArray(prevTempOrders)
          ? [...prevTempOrders, selectedRow]
          : [selectedRow];
        return newTempOrders;
      });
      setFilteredOrder(updatedTempTraOrder);
      setTraOrders(updatedTempTraOrder2);
      setSelectedRow(null);
    }
  };

  const moveOrderToLeft = () => {
    if (selectedRow && !filteredOrder.includes(selectedRow)) {
      const updatedFilteredTraOrder = tempOrders?.filter(
        (item) => item?.id !== selectedRow?.id
      );
      setFilteredOrder((prevTempOrders) => {
        const newTempOrders = Array.isArray(prevTempOrders)
          ? [...prevTempOrders, selectedRow]
          : [selectedRow];
        return newTempOrders;
      });
      setTempOrders(updatedFilteredTraOrder);
      setSelectedRow(null);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDateChange = (date) => {
    if (isWeekday(date) && date >= new Date()) {
      setEntry({ ...entry, routeDate: date });
      setSelectedDate(date);
    }
  };
  const isWeekend = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };
  const isWeekday = (date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  };
  const getNextWorkingDay = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 2);
    } else if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    return tomorrow;
  };

  const isSelected = (item) => {
    return selectedRow && selectedRow?.id === item?.id;
  };

  const handleRowClick = (item) => {
    setSelectedRow(item);
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    switch (id) {
      case "route":
        setEntry({ ...entry, route: value });
        break;
      case "chauffeur":
        setEntry({ ...entry, chauffeur: value });
        break;
      case "truck":
        setEntry({ ...entry, truck: value });
        break;
      case "trailer":
        setEntry({ ...entry, trailer: value });
        break;
      default:
        break;
    }
  };

  const clearData = () => {
    setSelectedRow(null);
    setEntry("");
    setTempOrders(null);
    setSearchTerm("");
    setSelectedDate(getNextWorkingDay());
    setFilteredOrder(null);
    setTraOrders([null]);
    setRouteOrders([null]);
    setSelectedRouteRowId(null);
    setUnloadedEntry(true);
  };

  const selectModelAndClose = (id) => {
    setSelectedRouteRowId(id);
    toggleModal();
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleButtonClick = () => {
    toggleModal();
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #ccc",
  };

  const thStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    backgroundColor: "#f0f0f0",
  };

  const tdStyle = {
    padding: "10px",
    border: "1px solid #ccc",
  };

  const hoveredRowStyle = {
    backgroundColor: "lightblue",
    cursor: "pointer",
  };

  return (
    <>
      <Modal
        isOpen={transportPanelModal}
        toggle={toggleTraFlowMod}
        fullscreen
        onClosed={handleModalClosed}
        unmountOnClose
        backdrop="static"
        style={{
          maxWidth: "65%",
          maxHeight: "90%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          left: "17%",
          top: "7%",
        }}
      >
        <ModalHeader toggle={toggleTraFlowMod}>
          <strong>Toevoegen Transport Order</strong>
        </ModalHeader>
        <ModalBody>
          <div className="row" style={{ height: "20%" }}>
            <div className="col-md-4" style={{}}>
              <div>
                <label htmlFor="searchField">
                  <strong>Verkooporder:</strong>
                </label>
                <input
                  type="text"
                  id="searchField"
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{
                    marginLeft: "10px",
                    width: "40%",
                    padding: "5px",
                    borderRadius: "3px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            </div>

            <div className="col-md-4" style={{}}>
              <label htmlFor="calendar">
                <strong>Routedatum:</strong>
              </label>
              <div style={{ position: "relative" }}>
                <DatePicker
                  id="calendar"
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  filterDate={isWeekend}
                />
                <span
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    top: "50%",
                    marginLeft: "-20px",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  ▼
                </span>
              </div>
            </div>

            <div className="col-md-4" style={{}}>
              <div>
                <div>
                  <label htmlFor="dropdown1">
                    <strong>Route:</strong>
                  </label>
                  <select
                    id="route"
                    style={{ marginLeft: "41px", width: "50%" }}
                    value={entry?.route}
                    onChange={handleChange}
                  >
                    <option value=""></option>
                    {routes &&
                      routes.map((val) => (
                        <option key={val.id} value={val.route}>
                          {val.route}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dropdown2">
                    <strong>Chauffeur:</strong>
                  </label>
                  <select
                    id="chauffeur"
                    style={{
                      marginLeft: "10px",
                      marginTop: "7px",
                      width: "50%",
                    }}
                    value={entry?.chauffeur}
                    onChange={handleChange}
                  >
                    <option value=""></option>
                    {drivers &&
                      drivers.map((val) => (
                        <option key={val.id} value={val.driver}>
                          {val.driver}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dropdown3">
                    <strong>Truck:</strong>{" "}
                  </label>
                  <select
                    id="truck"
                    style={{
                      marginLeft: "44px",
                      marginTop: "7px",
                      width: "50%",
                    }}
                    value={entry?.truck}
                    onChange={handleChange}
                  >
                    <option value=""></option>
                    {trucks &&
                      trucks.map((val) => (
                        <option key={val.id} value={val.truck}>
                          {val.truck}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dropdown4">
                    <strong>Trailer:</strong>
                  </label>
                  <select
                    id="trailer"
                    style={{
                      marginLeft: "38px",
                      marginTop: "7px",
                      width: "50%",
                    }}
                    value={entry?.trailer}
                    onChange={handleChange}
                  >
                    <option value=""></option>
                    {trailers &&
                      trailers.map((val) => (
                        <option key={val.id} value={val.trailer}>
                          {val.trailer}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <hr style={{ margin: "1rem 0" }} />

          <div style={{ display: "flex", flexDirection: "row", height: "73%" }}>
            <div
              style={{
                flex: "0 0 47.5%",
                border: "1px solid black",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <div>
                <table
                  className="table table-hover"
                  style={{ width: "100%", height: "100%" }}
                >
                  <thead>
                    <tr>
                      <th>Verkooporder</th>
                      <th>Naam</th>
                      <th>PostCode</th>
                      <th>Plaats</th>
                      <th>Land</th>
                      <th>Leverdatum</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrder?.map((item, index) => (
                      <tr
                        style={{ height: "65px" }}
                        key={`${item?.id},${index}`}
                        className={isSelected(item) ? "table-active" : ""}
                        onClick={() => handleRowClick(item)}
                      >
                        <td>{item?.orderNumber}</td>
                        <td>{item?.user}</td>
                        <td>{item?.postCode}</td>
                        <td>{item?.city}</td>
                        <td>{item?.country}</td>
                        <td>{item?.deliveryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              style={{
                flex: "0 0 5%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <button
                className="btn btn-primary mb-3"
                disabled={colorValue !== "N" && colorValue !== "R"}
                style={{ fontSize: "15px", padding: "10px" }}
                onClick={moveOrderToRight}
              >
                {" "}
                <FontAwesomeIcon icon={faGreaterThan} />{" "}
                <FontAwesomeIcon icon={faGreaterThan} />{" "}
              </button>
              <button
                className="btn btn-secondary"
                disabled={colorValue !== "N" && colorValue !== "R"}
                style={{ fontSize: "15px", padding: "10px" }}
                onClick={moveOrderToLeft}
              >
                <FontAwesomeIcon icon={faLessThan} />{" "}
                <FontAwesomeIcon icon={faLessThan} />
              </button>
            </div>

            <div
              style={{
                flex: "0 0 47.5%",
                border: "1px solid black",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <div>
                <table
                  className="table table-hover"
                  style={{ width: "100%", height: "100%" }}
                >
                  <thead>
                    <tr>
                      <th>Verkooporder</th>
                      <th>Naam</th>
                      <th>PostCode</th>
                      <th>Plaats</th>
                      <th>Land</th>
                      <th>Leverdatum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempOrders &&
                      tempOrders.length > 0 &&
                      tempOrders?.map((item, index) => (
                        <tr
                          key={`${item?.id},${index}`}
                          className={isSelected(item) ? "table-active" : ""}
                          onClick={() => handleRowClick(item)}
                        >
                          <td>{item?.orderNumber}</td>
                          <td>{item?.customerName}</td>
                          <td>{item?.postCode}</td>
                          <td>{item?.city}</td>
                          <td>{item?.country}</td>
                          <td>{item?.deliveryDate}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div style={{ marginRight: "5%" }}>
            {unloadedEntry &&
              (
                user?.departmentsSet[0]?.depName === "ADMIN" ||
                user?.departmentsSet[0]?.depName === "TRA"
              ) && (
                <Button
                  style={{ marginRight: "30px" }}
                  color="primary"
                  onClick={() => saveOrderTra()}
                >
                  Opslaan
                </Button>
              )}

            {!unloadedEntry &&
              (user?.departmentsSet[0]?.depName === "ADMIN" ||
                user?.departmentsSet[0]?.depName === "TRA") && (
                <Button
                  style={{ marginRight: "30px" }}
                  color="primary"
                  onClick={() => updateOrderTra()}
                  disabled={colorValue === "G" || colorValue === "Y"}
                >
                  Wijzigen
                </Button>
              )}
            {(user?.departmentsSet[0]?.depName === "ADMIN" ||
              user?.departmentsSet[0]?.depName === "TRA") && (
              <Button
                color="danger"
                onClick={() => toggleConfirmation()}
                disabled={
                  unloadedEntry || colorValue === "G" || colorValue === "Y"
                }
              >
                Verwijder
              </Button>
            )}
          </div>
          <div style={{ marginRight: "8%" }}>
          
            <Button color="dark" onClick={handleButtonClick}>
              Existing
            </Button>
          </div>
          <div style={{ marginRight: "8%" }}>
          {(user?.departmentsSet[0]?.depName === "ADMIN" ||
              user?.departmentsSet[0]?.depName === "TRA") && (
            <Button
              color="success"
              style={{ marginRight: "30px" }}
              onClick={startTraOrders}
              disabled={
                unloadedEntry || colorValue === "G" || colorValue === "Y"
              }
            >
              Start Route
            </Button>
            )}
            {(user?.departmentsSet[0]?.depName === "ADMIN" ||
              user?.departmentsSet[0]?.depName === "TRA") && (
            <Button
              color="secondary"
              onClick={finishTraOrders}
              disabled={
                unloadedEntry || colorValue === "G" || colorValue === "R"
              }
            >
              Afmeldan Route
            </Button> )}
          </div>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        toggle={toggleModal}
        fullscreen
        unmountOnClose
        backdrop="static"
        style={{
          maxWidth: "40%",
          maxHeight: "40%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          left: "30%",
          top: "25%",
        }}
      >
        <ModalHeader toggle={toggleModal}>
          <strong>Saved Orders For Routes</strong>
        </ModalHeader>
        <ModalBody>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Entries</th>
              </tr>
            </thead>
            <tbody>
              {routeOrders?.map((item, index) => (
                <tr
                  key={item?.id}
                  style={{
                    cursor: "pointer",
                    ...(selectedRouteRowId === item?.id ? hoveredRowStyle : {}),
                  }}
                  onClick={() => selectModelAndClose(item?.order?.id)}
                  className="hoveredRow"
                >
                  <td style={tdStyle}>{item?.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </Modal>
      <Modal isOpen={confirmationModal} toggle={toggleConfirmation}>
        <ModalBody style={{ justifyContent: "center" }}>
          Remove TRA data
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
    </>
  );
}

export default TransportModal;
