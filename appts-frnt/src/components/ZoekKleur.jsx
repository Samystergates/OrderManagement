import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGreaterThan, faLessThan } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useState } from "react";
import { getCurrentUserDetail, isLoggedIn } from "../auth";
import Draggable from "react-draggable";
import ToevKleur from "./ToevKleur";
import {
  loadAllWheelColors,
  deleteWheelColor,
} from "../services/wheelColor-service";
function ZoekKleur({ zKPanelModal, toggleZKFlowMod }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(false);
  const [login, setLogin] = useState(null);
  const [tKPanelModal, setTKPanelModal] = useState(false);
  const [tKPanelModalUpdate, setTKPanelModalUpdate] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [wheelColor, setWheelColor] = useState([]);

  useEffect(() => {
    setUser(getCurrentUserDetail());
    setLogin(isLoggedIn());
    loadWheelColor();
  }, []);

  const toggleTKFlowModSave = () => {
    setTKPanelModal(!tKPanelModal);
  };

  const toggleTKFlowModUpdate = () => {
    setTKPanelModalUpdate(!tKPanelModalUpdate);
  };

  const toggleTKFlowMoRemove = () => {
    deleteWheelColor(selectedRowId)
      .then((data) => {
        loadWheelColor();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  function loadWheelColor() {
    loadAllWheelColors()
      .then((data) => {
        setWheelColor([...data]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleDrag = (e, ui) => {
    const { x, y } = position;
    const { offsetWidth, offsetHeight } = e.target.parentElement;
    const { innerWidth, innerHeight } = window;

    const maxX = innerWidth - offsetWidth;
    const maxY = innerHeight - offsetHeight;

    const newX = Math.min(Math.max(x + ui.deltaX, 0), maxX);
    const newY = Math.min(Math.max(y + ui.deltaY, 0), maxY);

    setPosition({ x: newX, y: newY });
  };

  const toggle = (val) => {
    if (user.departmentsSet[0].depName === "ADMIN") {
      setModal(!modal);
      if (val === "yes") {
        toggleTKFlowMoRemove();
      } else if (val === "no") {
      }
    } else {
      toast.error("UnAuthorized Department");
    }
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
    // <Draggable onDrag={handleDrag} positionOffset={{ x: 0, y: 0 }}>
    <>
      <Modal
        isOpen={zKPanelModal}
        toggle={toggleZKFlowMod}
        fullscreen
        unmountOnClose
        backdrop="static"
        style={{
          maxWidth: "50%",
          maxHeight: "70%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          left: "25%",
          top: "15%",
        }}
      >
        <ModalHeader toggle={toggleZKFlowMod}>
          <strong>Zoek Kleur gegevens</strong>
        </ModalHeader>
        <ModalBody>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Kleur ID</th>
                <th style={thStyle}>Naam</th>
                <th style={thStyle}>Code Nat</th>
                <th style={thStyle}>Code Poeder</th>
                <th style={thStyle}>RGB Codes</th>
                <th style={thStyle}>RAL Codes</th>
              </tr>
            </thead>
            <tbody>
              {wheelColor?.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    ...(selectedRowId === item.id ? hoveredRowStyle : {}),
                  }}
                  onClick={() => setSelectedRowId(item.id)}
                  className="hoveredRow"
                >
                  <td style={tdStyle}>{item.id}</td>
                  <td style={tdStyle}>{item.colorName}</td>
                  <td style={tdStyle}>{item.codeVert}</td>
                  <td style={tdStyle}>{item.codePoeder}</td>
                  <td style={tdStyle}>
                    {item.red},{item.green},{item.blue}
                  </td>
                  <td
                    style={{ backgroundColor: `rgb(${item.red}, ${item.green}, ${item.blue})`, padding: "10px", border: "1px solid #ccc" }}
                  ></td>
                </tr>
              ))}
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <div style={{ marginRight: "5%" }}>
            <Button
              style={{ marginRight: "50px" }}
              color="success"
              onClick={toggleTKFlowModSave}
            >
              Toevoegen
              <ToevKleur
                toggleTKFlowMod={toggleTKFlowModSave}
                tKPanelModal={tKPanelModal}
                wheelColor={wheelColor}
                isWijzigen={false}
                loadWheelColorProp={loadWheelColor}
              />
            </Button>
            <Button
              color="primary"
              style={{ marginRight: "50px" }}
              onClick={selectedRowId ? toggleTKFlowModUpdate : undefined}
            >
              Wijzigen
              {selectedRowId && (
                <ToevKleur
                  toggleTKFlowMod={toggleTKFlowModUpdate}
                  tKPanelModal={tKPanelModalUpdate}
                  wheelColor={wheelColor}
                  selectedRowId={selectedRowId}
                  isWijzigen={true}
                  loadWheelColorProp={loadWheelColor}
                />
              )}
            </Button>
            <Button
              color="secondary"
              style={{ marginRight: "20px" }}
              onClick={selectedRowId ? toggle : undefined}
            >
              Verwijder
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      <Modal isOpen={modal} toggle={toggle}>
        <ModalBody style={{ justifyContent: "center" }}>
          Remove the Entry with ID: {selectedRowId}
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
    </>

    //   </Draggable>
  );
}

export default ZoekKleur;
