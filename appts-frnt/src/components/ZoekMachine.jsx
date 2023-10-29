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
import ToevMachine from "./ToevMachine";
import {
  loadAllWheelMachineSize,
  deleteMachineSize,
} from "../services/machineSizes-service";
function ZoekMachine({ zMPanelModal, toggleZMFlowMod }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(false);
  const [login, setLogin] = useState(null);
  const [tMPanelModalSave, setTMPanelModalSave] = useState(false);
  const [tMPanelModalUpdate, setTMPanelModalUpdate] = useState(false);
  const [machineSizes, setMachineSizes] = useState([]);
  const [selectedMerk, setSelectedMerk] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);

  useEffect(() => {
    setUser(getCurrentUserDetail());
    setLogin(isLoggedIn());
    loadMachineSizes();
  }, []);

  function loadMachineSizes() {
    loadAllWheelMachineSize()
      .then((data) => {
        setMachineSizes([...data]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const toggleTMFlowModSave = () => {
    setTMPanelModalSave(!tMPanelModalSave);
  };

  const toggleTMFlowModUpdate = () => {
    setTMPanelModalUpdate(!tMPanelModalUpdate);
  };

  const filteredAndSortedMachineSizes = machineSizes
    .filter((item) => (selectedMerk ? item.merk === selectedMerk : true))
    .sort((a, b) => (a.merk === selectedMerk ? -1 : 1));

  const handleMerkChange = (e) => {
    setSelectedMerk(e.target.value);
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

  const toggleTKFlowMoRemove = () => {
    deleteMachineSize(selectedRowId)
      .then((data) => {
        loadMachineSizes();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const distinctMerks = Array.from(
    new Set(machineSizes.map((item) => item.merk))
  );

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
        isOpen={zMPanelModal}
        toggle={toggleZMFlowMod}
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
        <ModalHeader toggle={toggleZMFlowMod}>
          <strong>Zoek Machine gegevens</strong>
        </ModalHeader>
        <ModalBody>
          <div className="col-md-4" style={{}}>
            <div>
              <label htmlFor="searchField"></label>
              <select
                style={{
                  width: "50%",
                  border: "3px solid #ccc",
                  outline: "none",
                  background: "white",
                  padding: "5px",
                  borderRadius: "3px",
                }}
                value={selectedMerk}
                onChange={handleMerkChange}
              >
                <option value="">Selecteer merk</option>
                {distinctMerks.map((merk) => (
                  <option key={merk} value={merk}>
                    {merk}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <hr style={{ margin: "1rem 0" }} />
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Merk</th>
                <th style={thStyle}>Model</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Bandenmaat</th>
                <th style={thStyle}>Velgmaat</th>
                <th style={thStyle}>Veltype</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedMachineSizes?.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    ...(selectedRowId === item.id ? hoveredRowStyle : {}),
                  }}
                  onClick={() => setSelectedRowId(item.id)}
                  className="hoveredRow"
                >
                  <td style={tdStyle}>{item.id}</td>
                  <td style={tdStyle}>{item.merk}</td>
                  <td style={tdStyle}>{item.model}</td>
                  <td style={tdStyle}>{item.type}</td>
                  <td style={tdStyle}>{item.bandenmaat}</td>
                  <td style={tdStyle}>{item.velgmaat}</td>
                  <td style={tdStyle}>{item.velgtype}</td>
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
              onClick={toggleTMFlowModSave}
            >
              Toevoegen
              <ToevMachine
                toggleTMFlowMod={toggleTMFlowModSave}
                tMPanelModal={tMPanelModalSave}
                machineSizes={machineSizes}
                isWijzigen={false}
                loadWheelMachineSizeProp={loadMachineSizes}
              />
            </Button>
            <Button
              color="primary"
              style={{ marginRight: "50px" }}
              onClick={selectedRowId ? toggleTMFlowModUpdate : undefined}
            >
              Wijzigen
              {selectedRowId && (
                <ToevMachine
                  toggleTMFlowMod={toggleTMFlowModUpdate}
                  tMPanelModal={tMPanelModalUpdate}
                  machineSizes={machineSizes}
                  selectedRowId={selectedRowId}
                  isWijzigen={true}
                  loadWheelMachineSizeProp={loadMachineSizes}
                />
              )}
            </Button>
            <Button
              color="secondary"
              style={{ marginRight: "20px" }}
              onClick={selectedRowId ?  toggle : undefined}
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
  );
}

export default ZoekMachine;
