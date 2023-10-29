import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGreaterThan, faLessThan } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  saveMachineSize,
  updateMachineSize,
} from "../services/machineSizes-service";
import { getCurrentUserDetail, isLoggedIn } from "../auth";
function ToevMachine({
  tMPanelModal,
  toggleTMFlowMod,
  machineSizes,
  selectedRowId,
  isWijzigen,
  loadWheelMachineSizeProp,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(null);
  const [error, setError] = useState({
    errors: {},
    isError: false,
  });
  const [entry, setEntry] = useState(null);

  const [dropdownOpenAfdeling, setDropdownOpenAfdeling] = useState(false);
  const [selectedAfdeling, setSelectedAfdeling] = useState("");
  const [dropdownOptionsAfdeling, setDropdownOptionsAfdeling] = useState([]);

  const [dropdownOpenMerk, setDropdownOpenMerk] = useState(false);
  const [selectedMerk, setSelectedMerk] = useState("");
  const [dropdownOptionsMerk, setDropdownOptionsMerk] = useState([]);

  const [dropdownOpenModel, setDropdownOpenModel] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [dropdownOptionsModel, setDropdownOptionsModel] = useState([]);

  const [dropdownOpenType, setDropdownOpenType] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [dropdownOptionsType, setDropdownOptionsType] = useState([]);

  const [dropdownOpenBandenmaat, setDropdownOpenBandenmaat] = useState(false);
  const [selectedBandenmaat, setSelectedBandenmaat] = useState("");
  const [dropdownOptionsBandenmaat, setDropdownOptionsBandenmaat] = useState(
    []
  );

  const [dropdownOpenVelgmaat, setDropdownOpenVelgmaat] = useState(false);
  const [selectedVelgmaat, setSelectedVelgmaat] = useState("");
  const [dropdownOptionsVelgmaat, setDropdownOptionsVelgmaat] = useState([]);

  const [dropdownOpenVUitvoering, setDropdownOpenVUitvoering] = useState(false);
  const [selectedVUitvoering, setSelectedVUitvoering] = useState("");
  const [dropdownOptionsVUitvoering, setDropdownOptionsVUitvoering] = useState(
    []
  );

  const [dropdownOpenUBoutgat, setDropdownOpenUBoutgat] = useState(false);
  const [selectedUBoutgat, setSelectedUBoutgat] = useState("");
  const [dropdownOptionsUBoutgat, setDropdownOptionsUBoutgat] = useState([]);

  const [dropdownOpenFlens, setDropdownOpenFlens] = useState(false);
  const [selectedFlens, setSelectedFlens] = useState("");
  const [dropdownOptionsFlens, setDropdownOptionsFlens] = useState([]);

  const [selectedKoelgaten, setSelectedkoelgaten] = useState("");

  useEffect(() => {
    setUser(getCurrentUserDetail());
    setLogin(isLoggedIn());
    if (isWijzigen && selectedRowId !== null) {
      const selectedEntry = machineSizes?.find(
        (item) => item.id === selectedRowId
      );
      if (selectedEntry) {
        setEntry(selectedEntry);
        setSelectedAfdeling(selectedEntry.department);
        setSelectedMerk(selectedEntry.merk);
        setSelectedModel(selectedEntry.model);
        setSelectedType(selectedEntry.type);
        setSelectedBandenmaat(selectedEntry.bandenmaat);
        setSelectedVUitvoering(selectedEntry.velgtype);
        setSelectedUBoutgat(selectedEntry.typeBoutgat);
        setSelectedFlens(selectedEntry.uitvoerechtingFlens);
        setSelectedkoelgaten(selectedEntry.koelgaten);
      } else {
        setEntry(null);
        setSelectedAfdeling("");
        setSelectedMerk("");
        setSelectedModel("");
        setSelectedType("");
        setSelectedBandenmaat("");
        setSelectedVUitvoering("");
        setSelectedUBoutgat("");
        setSelectedFlens("");
        setSelectedkoelgaten("NEE")
      }
    }
  }, [isWijzigen, selectedRowId, machineSizes]);

  useEffect(() => {
    if (machineSizes) {
      const afdelingOptions = Array.from(
        new Set(machineSizes.map((item) => item.department))
      );
      setDropdownOptionsAfdeling(afdelingOptions);

      const merkOptions = Array.from(
        new Set(machineSizes.map((item) => item.merk))
      );
      setDropdownOptionsMerk(merkOptions);

      const modelOptions = Array.from(
        new Set(machineSizes.map((item) => item.model))
      );
      setDropdownOptionsModel(modelOptions);

      const typeOptions = Array.from(
        new Set(machineSizes.map((item) => item.type))
      );
      setDropdownOptionsType(typeOptions);

      const bandenmaatOptions = Array.from(
        new Set(machineSizes.map((item) => item.bandenmaat))
      );
      setDropdownOptionsBandenmaat(bandenmaatOptions);

      const velgmaatOptions = Array.from(
        new Set(machineSizes.map((item) => item.velgmaat))
      );
      setDropdownOptionsVelgmaat(velgmaatOptions);

      const vUitvoering = Array.from(
        new Set(machineSizes.map((item) => item.velgtype))
      );
      setDropdownOptionsVUitvoering(vUitvoering);

      const uBoutgatOptions = Array.from(
        new Set(machineSizes.map((item) => item.typeBoutgat))
      );
      setDropdownOptionsUBoutgat(uBoutgatOptions);

      const flensOptions = Array.from(
        new Set(machineSizes.map((item) => item.uitvoerechtingFlens))
      );
      setDropdownOptionsFlens(flensOptions);
    }
  }, [machineSizes]);

  const handleDropdownClick = (field) => {
    switch (field) {
      case "Afdeling":
        setDropdownOpenAfdeling(!dropdownOpenAfdeling);
        break;
      case "Merk":
        setDropdownOpenMerk(!dropdownOpenMerk);
        break;
      case "Model":
        setDropdownOpenModel(!dropdownOpenModel);
        break;
      case "Type":
        setDropdownOpenType(!dropdownOpenType);
        break;
      case "Bandenmaat":
        setDropdownOpenBandenmaat(!dropdownOpenBandenmaat);
        break;
      case "Velgmaat":
        setDropdownOpenVelgmaat(!dropdownOpenVelgmaat);
        break;
      case "VUitvoering":
        setDropdownOpenVUitvoering(!dropdownOpenVUitvoering);
        break;
      case "UBoutgat":
        setDropdownOpenUBoutgat(!dropdownOpenUBoutgat);
        break;
      case "Flens":
        setDropdownOpenFlens(!dropdownOpenFlens);
        break;
      default:
        break;
    }
  };

  const handleDropdownSelect = (field, value) => {
    switch (field) {
      case "Afdeling":
        setEntry({ ...entry, department: value });
        setSelectedAfdeling(value);
        setDropdownOpenAfdeling(false);
        break;
      case "Merk":
        setEntry({ ...entry, merk: value });
        setSelectedMerk(value);
        setDropdownOpenMerk(false);
        break;
      case "Model":
        setEntry({ ...entry, model: value });
        setSelectedModel(value);
        setDropdownOpenModel(false);
        break;
      case "Type":
        setEntry({ ...entry, type: value });
        setSelectedType(value);
        setDropdownOpenType(false);
        break;
      case "Bandenmaat":
        setEntry({ ...entry, bandenmaat: value });
        setSelectedBandenmaat(value);
        setDropdownOpenBandenmaat(false);
        break;
      case "Velgmaat":
        setEntry({ ...entry, velgmaat: value });
        setSelectedVelgmaat(value);
        setDropdownOpenVelgmaat(false);
        break;
      case "VUitvoering":
        setEntry({ ...entry, velgtype: value });
        setSelectedVUitvoering(value);
        setDropdownOpenVUitvoering(false);
        break;
      case "UBoutgat":
        setEntry({ ...entry, typeBoutgat: value });
        setSelectedUBoutgat(value);
        setDropdownOpenUBoutgat(false);
        break;
      case "Flens":
        setEntry({ ...entry, uitvoerechtingFlens: value });
        setSelectedFlens(value);
        setDropdownOpenFlens(false);
        break;
      default:
        break;
    }
  };

  const handleChange = (event) => {
    const { id, value } = event.target;

    switch (id) {
      case "Afdeling":
        setSelectedAfdeling(value);
        setEntry({ ...entry, department: value });
        break;
      case "MachineMerk":
        setSelectedMerk(value);
        setEntry({ ...entry, merk: value });
        break;
      case "MachineModel":
        setSelectedModel(value);
        setEntry({ ...entry, model: value });
        break;
      case "MachineType":
        setSelectedType(value);
        setEntry({ ...entry, type: value });
        break;
      case "Bandenmaat":
        setSelectedBandenmaat(value);
        setEntry({ ...entry, bandenmaat: value });
        break;
      case "Velgmaat":
        setSelectedVelgmaat(value);
        setEntry({ ...entry, velgmaat: value });
        break;
      case "VelgUitvoering":
        setSelectedVUitvoering(value);
        setEntry({ ...entry, velgtype: value });
        break;
      case "UitvoeringBoutgat":
        setSelectedUBoutgat(value);
        setEntry({ ...entry, typeBoutgat: value });
        break;
      case "FlensUitvoering":
        setSelectedFlens(value);
        setEntry({ ...entry, uitvoerechtingFlens: value });
        break;
      case "Koelgaten":
        const isChecked = event.target.checked;
        const val = isChecked ? "JA" : "NEE";
        setEntry({ ...entry, koelgaten: val });
        setSelectedkoelgaten(val);
        break;
      default:
        break;
    }
  };

  const saveFunction = () => {
    if (!entry?.merk) {
      toast.error("Merk is required.");
      return;
    }
    if (!isWijzigen) {
      saveMachineSize(entry)
        .then((resp) => {
          toast.success(
            "Wheel Machine Size is saved successfully with id " + resp.id
          );
          setEntry({
            id: "",
            merk: "",
            model: "",
            type: "",
            bandenmaat: "",
            velgmaat: "",
            velgtype: "",
            velgnummer: "",
            velgleverancier: "",
            department: "",
            naafgat: "",
            steek: "",
            aantalBoutgat: "",
            verdlingBoutgaten: "",
            diameter: "",
            typeBoutgat: "",
            maatVerzinking: "",
            et: "",
            afstandVV: "",
            afstandVA: "",
            uitvoerechtingFlens: "",
            dikte: "",
            koelgaten: "NEE",
            opmerking: "",
          });
          setSelectedAfdeling("");
          setSelectedMerk("");
          setSelectedModel("");
          setSelectedType("");
          setSelectedBandenmaat("");
          setSelectedVUitvoering("");
          setSelectedUBoutgat("");
          setSelectedFlens("");
          setSelectedkoelgaten("NEE");
          loadWheelMachineSizeProp();
        })
        .catch((error) => {
          console.log(error);
          console.log("Error log");
          toast.error("Failed to save");
          setError({
            errors: error,
            isError: true,
          });
        });
    } else {
      updateMachineSize(entry)
        .then((resp) => {
          toast.success(
            "Wheel Machine Size is updated successfully with id " + resp.id
          );
          setEntry({
            id: "",
            merk: "",
            model: "",
            type: "",
            bandenmaat: "",
            velgmaat: "",
            velgtype: "",
            velgnummer: "",
            velgleverancier: "",
            department: "",
            naafgat: "",
            steek: "",
            aantalBoutgat: "",
            verdlingBoutgaten: "",
            diameter: "",
            typeBoutgat: "",
            maatVerzinking: "",
            et: "",
            afstandVV: "",
            afstandVA: "",
            uitvoerechtingFlens: "",
            dikte: "",
            koelgaten: "NEE",
            opmerking: "",
          });
          setSelectedAfdeling("");
          setSelectedMerk("");
          setSelectedModel("");
          setSelectedType("");
          setSelectedBandenmaat("");
          setSelectedVUitvoering("");
          setSelectedUBoutgat("");
          setSelectedFlens("");
          setSelectedkoelgaten("NEE");
          loadWheelMachineSizeProp();
        })
        .catch((error) => {
          console.log(error);
          console.log("Error log");
          toast.error("Failed to save");
          setError({
            errors: error,
            isError: true,
          });
        });
    }
  };

  const labelStyle = { marginBottom: "5px" };
  const inputStyle = {
    width: "12%",
    marginLeft: "20px",
    border: "1px solid #ccc",
    borderRadius: "3px",
  };
  const inputStyleDiv2 = {
    width: "40%",
    marginLeft: "20px",
    border: "1px solid #ccc",
    borderRadius: "3px",
  };
  const checkboxStyle = { width: "50px", height: "15px", marginBottom: "10px" };
  const buttonStyle = {
    position: "absolute",
    right: "0",
    top: "0",
    height: "100%",
    width: "20%",
    border: "1px solid #ccc",
    background: "#f0f0f0",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  return (
    <Modal
      isOpen={tMPanelModal}
      toggle={toggleTMFlowMod}
      fullscreen
      unmountOnClose
      backdrop="static"
      style={{
        maxWidth: "75%",
        maxHeight: "90%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        left: "15%",
        top: "5%",
      }}
    >
      <ModalHeader toggle={toggleTMFlowMod}>
        <strong>Toevoegen Machine</strong>
      </ModalHeader>
      <ModalBody>
        <div style={{ padding: "3px" }}>
          <label htmlFor="Afdeling" style={labelStyle}>
            <strong>Afdeling:</strong>
          </label>
          <input
            type="text"
            id="Afdeling"
            style={inputStyle}
            value={selectedAfdeling}
            onChange={handleChange}
          />
          <span
            onClick={() => handleDropdownClick("Afdeling")}
            style={{
              padding: "4px",
              border: "1px solid #ccc",
              borderTop: "1px solid #ccc",
              borderRight: "1px solid #ccc",
              borderBottom: "1px solid #ccc",
              borderLeft: "none",
              cursor: "pointer",
              borderRadius: "3px",
              fontSize: "13px",
            }}
          >
            ▼
          </span>
          {dropdownOpenAfdeling && (
            <div
              style={{
                zIndex: 1,
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "3px",
                marginTop: "2px",
                maxHeight: "120px",
                maxWidth: "150px",
                marginLeft: "100px",
                overflowY: "auto",
              }}
            >
              {dropdownOptionsAfdeling.map((option) => (
                <div
                  key={option}
                  onClick={() => handleDropdownSelect("Afdeling", option)}
                  style={{
                    padding: "4px",
                    borderBottom: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <div style={{ flex: "25%", padding: "3px" }}>
            <label htmlFor="MachineMerk" style={{ labelStyle }}>
              <strong>Machine Merk:</strong>
            </label>
            <input
              type="text"
              id="MachineMerk"
              style={inputStyleDiv2}
              value={selectedMerk}
              onChange={handleChange}
            />
            <span
              onClick={() => handleDropdownClick("Merk")}
              style={{
                padding: "4px",
                border: "1px solid #ccc",
                borderTop: "1px solid #ccc",
                borderRight: "1px solid #ccc",
                borderBottom: "1px solid #ccc",
                borderLeft: "none",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: "13px",
              }}
            >
              ▼
            </span>
            {dropdownOpenMerk && (
              <div
                style={{
                  zIndex: 1,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  marginTop: "2px",
                  maxHeight: "120px",
                  maxWidth: "150px",
                  marginLeft: "140px",
                  overflowY: "auto",
                }}
              >
                {dropdownOptionsMerk.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleDropdownSelect("Merk", option)}
                    style={{
                      padding: "4px",
                      borderBottom: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: "25%", padding: "3px" }}>
            <label htmlFor="MachineModel" style={labelStyle}>
              <strong> Machine Model:</strong>
            </label>
            <input
              type="text"
              id="MachineModel"
              style={inputStyleDiv2}
              value={selectedModel}
              onChange={handleChange}
            />
            <span
              onClick={() => handleDropdownClick("Model")}
              style={{
                padding: "4px",
                border: "1px solid #ccc",
                borderTop: "1px solid #ccc",
                borderRight: "1px solid #ccc",
                borderBottom: "1px solid #ccc",
                borderLeft: "none",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: "13px",
              }}
            >
              ▼
            </span>
            {dropdownOpenModel && (
              <div
                style={{
                  zIndex: 1,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  marginTop: "2px",
                  maxHeight: "120px",
                  maxWidth: "150px",
                  marginLeft: "140px",
                  overflowY: "auto",
                }}
              >
                {dropdownOptionsModel.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleDropdownSelect("Model", option)}
                    style={{
                      padding: "4px",
                      borderBottom: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: "25%", padding: "3px" }}>
            <label htmlFor="MachineType" style={labelStyle}>
              <strong>Machine Type:</strong>
            </label>
            <input
              type="text"
              id="MachineType"
              style={inputStyleDiv2}
              value={selectedType}
              onChange={handleChange}
            />
            <span
              onClick={() => handleDropdownClick("Type")}
              style={{
                padding: "4px",
                border: "1px solid #ccc",
                borderTop: "1px solid #ccc",
                borderRight: "1px solid #ccc",
                borderBottom: "1px solid #ccc",
                borderLeft: "none",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: "13px",
              }}
            >
              ▼
            </span>
            {dropdownOpenType && (
              <div
                style={{
                  zIndex: 1,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  marginTop: "2px",
                  maxHeight: "120px",
                  maxWidth: "150px",
                  marginLeft: "130px",
                  overflowY: "auto",
                }}
              >
                {dropdownOptionsType.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleDropdownSelect("Type", option)}
                    style={{
                      padding: "4px",
                      borderBottom: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: "25%", padding: "3px" }}>
            <label htmlFor="Bandenmaat" style={labelStyle}>
              <strong> Bandenmaat:</strong>
            </label>
            <input
              type="text"
              id="Bandenmaat"
              style={inputStyleDiv2}
              value={selectedBandenmaat}
              onChange={handleChange}
            />
            <span
              onClick={() => handleDropdownClick("Bandenmaat")}
              style={{
                padding: "4px",
                border: "1px solid #ccc",
                borderTop: "1px solid #ccc",
                borderRight: "1px solid #ccc",
                borderBottom: "1px solid #ccc",
                borderLeft: "none",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: "13px",
              }}
            >
              ▼
            </span>
            {dropdownOpenBandenmaat && (
              <div
                style={{
                  zIndex: 1,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  marginTop: "2px",
                  maxHeight: "120px",
                  maxWidth: "150px",
                  marginLeft: "120px",
                  overflowY: "auto",
                }}
              >
                {dropdownOptionsBandenmaat.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleDropdownSelect("Bandenmaat", option)}
                    style={{
                      padding: "4px",
                      borderBottom: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: "25%", padding: "3px" }}>
            <label htmlFor="Velgmaat" style={labelStyle}>
              <strong>Velgmaat:</strong>
            </label>
            <input
              type="text"
              id="Velgmaat"
              style={inputStyleDiv2}
              value={selectedVelgmaat}
              onChange={handleChange}
            />
            <span
              onClick={() => handleDropdownClick("Velgmaat")}
              style={{
                padding: "4px",
                border: "1px solid #ccc",
                borderTop: "1px solid #ccc",
                borderRight: "1px solid #ccc",
                borderBottom: "1px solid #ccc",
                borderLeft: "none",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: "13px",
              }}
            >
              ▼
            </span>
            {dropdownOpenVelgmaat && (
              <div
                style={{
                  zIndex: 1,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  marginTop: "2px",
                  maxHeight: "120px",
                  maxWidth: "150px",
                  marginLeft: "100px",
                  overflowY: "auto",
                }}
              >
                {dropdownOptionsVelgmaat.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleDropdownSelect("Velgmaat", option)}
                    style={{
                      padding: "4px",
                      borderBottom: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: "25%", padding: "3px" }}>
            <label htmlFor="VelgUitvoering" style={labelStyle}>
              <strong> Velg uitvoering:</strong>
            </label>
            <input
              type="text"
              id="VelgUitvoering"
              style={inputStyleDiv2}
              value={selectedVUitvoering}
              onChange={handleChange}
            />
            <span
              onClick={() => handleDropdownClick("VUitvoering")}
              style={{
                padding: "4px",
                border: "1px solid #ccc",
                borderTop: "1px solid #ccc",
                borderRight: "1px solid #ccc",
                borderBottom: "1px solid #ccc",
                borderLeft: "none",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: "13px",
              }}
            >
              ▼
            </span>
            {dropdownOpenVUitvoering && (
              <div
                style={{
                  zIndex: 1,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  marginTop: "2px",
                  maxHeight: "120px",
                  maxWidth: "150px",
                  marginLeft: "140px",
                  overflowY: "auto",
                }}
              >
                {dropdownOptionsVUitvoering.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleDropdownSelect("VUitvoering", option)}
                    style={{
                      padding: "4px",
                      borderBottom: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: "25%", padding: "3px" }}>
            <label htmlFor="VelgNummer" style={labelStyle}>
              <strong> Velg nummer:</strong>
            </label>
            <input
              type="text"
              id="VelgNummer"
              style={inputStyleDiv2}
              value={entry?.velgnummer}
              onChange={(e) =>
                setEntry({ ...entry, velgnummer: e.target.value })
              }
            />
          </div>
          <div style={{ flex: "25%", padding: "3px" }}>
            <label htmlFor="VelgLeverancier" style={labelStyle}>
              <strong> Velg leverancier:</strong>
            </label>
            <input
              type="text"
              id="VelgLeverancier"
              style={inputStyleDiv2}
              value={entry?.velgleverancier}
              onChange={(e) =>
                setEntry({ ...entry, velgleverancier: e.target.value })
              }
            />
          </div>
        </div>

        <div style={{ padding: "3px" }}>
          <div>
            <label htmlFor="Naafgat" style={{ marginBottom: "10px" }}>
              <strong> Naafgat:</strong>
            </label>
            <input
              type="text"
              id="Naafgat"
              style={{
                marginTop: "10px",
                width: "12%",
                marginLeft: "20px",
                border: "1px solid #ccc",
                borderRadius: "3px",
              }}
              value={entry?.naafgat}
              onChange={(e) => setEntry({ ...entry, naafgat: e.target.value })}
            />{" "}
            <strong style={{ marginLeft: "5px", fontSize: "14px" }}>
              {" "}
              mm.
            </strong>
          </div>
          <div>
            <label htmlFor="Steekcirkel" style={{ marginBottom: "10px" }}>
              <strong> Steekcirkel:</strong>
            </label>
            <input
              type="text"
              id="Steekcirkel"
              style={inputStyle}
              value={entry?.steek}
              onChange={(e) => setEntry({ ...entry, steek: e.target.value })}
            />
            <strong style={{ marginLeft: "5px", fontSize: "14px" }}>
              {" "}
              mm.
            </strong>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <div style={{ flex: "7%" }}>
              <label htmlFor="AantalBoutgaten" style={{ marginBottom: "10px" }}>
                <strong> Aantal boutgaten:</strong>
              </label>
              <input
                type="text"
                id="AantalBoutgaten"
                style={{
                  width: "40%",
                  marginLeft: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                }}
                value={entry?.aantalBoutgat}
                onChange={(e) =>
                  setEntry({ ...entry, aantalBoutgat: e.target.value })
                }
              />
            </div>
            <div style={{ flex: "50%" }}>
              <label htmlFor="Verdling" style={labelStyle}>
                <strong> Verdling:</strong>
              </label>
              <input
                type="text"
                id="Verdling"
                style={{
                  width: "16%",
                  marginLeft: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                }}
                value={entry?.verdlingBoutgaten}
                onChange={(e) =>
                  setEntry({ ...entry, verdlingBoutgaten: e.target.value })
                }
              />
            </div>
          </div>
          <div style={{ flex: "50%" }}>
            <label htmlFor="DiameterBoutgat" style={{ marginBottom: "10px" }}>
              <strong> Diameter boutgat:</strong>
            </label>
            <input
              type="text"
              id="DiameterBoutgat"
              style={inputStyle}
              value={entry?.diameter}
              onChange={(e) => setEntry({ ...entry, diameter: e.target.value })}
            />
            <strong style={{ marginLeft: "5px", fontSize: "14px" }}>
              {" "}
              mm.
            </strong>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <div style={{ flex: "7%" }}>
              <label htmlFor="UitvoeringBoutgat" style={labelStyle}>
                <strong> Uitvoering boutgat:</strong>
              </label>
              <input
                type="text"
                id="UitvoeringBoutgat"
                style={{
                  width: "40%",
                  marginLeft: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                }}
                value={selectedUBoutgat}
                onChange={handleChange}
              />
              <span
                onClick={() => handleDropdownClick("UBoutgat")}
                style={{
                  padding: "4px",
                  border: "1px solid #ccc",
                  borderTop: "1px solid #ccc",
                  borderRight: "1px solid #ccc",
                  borderBottom: "1px solid #ccc",
                  borderLeft: "none",
                  cursor: "pointer",
                  borderRadius: "3px",
                  fontSize: "13px",
                }}
              >
                ▼
              </span>
              {dropdownOpenUBoutgat && (
                <div
                  style={{
                    zIndex: 1,
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                    marginTop: "2px",
                    maxHeight: "120px",
                    maxWidth: "150px",
                    marginLeft: "170px",
                    overflowY: "auto",
                  }}
                >
                  {dropdownOptionsUBoutgat.map((option) => (
                    <div
                      key={option}
                      onClick={() => handleDropdownSelect("UBoutgat", option)}
                      style={{
                        padding: "4px",
                        borderBottom: "1px solid #ccc",
                        cursor: "pointer",
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: "50%" }}>
              <label htmlFor="MaatVerzinking" style={labelStyle}>
                <strong> Maat verzinking:</strong>
              </label>
              <input
                type="text"
                id="MaatVerzinking"
                style={{
                  width: "16%",
                  marginLeft: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                }}
                value={entry?.maatVerzinking}
                onChange={(e) =>
                  setEntry({ ...entry, maatVerzinking: e.target.value })
                }
              />
              <strong style={{ marginLeft: "5px", fontSize: "14px" }}>
                {" "}
                mm.
              </strong>
            </div>
          </div>
        </div>

        <div style={{ padding: "3px" }}>
          <div style={{ marginTop: "7px" }}>
            <label htmlFor="ET" style={labelStyle}>
              <strong> ET:</strong>
            </label>
            <input
              type="text"
              id="ET"
              style={inputStyle}
              value={entry?.et}
              onChange={(e) => setEntry({ ...entry, et: e.target.value })}
            />
            <strong style={{ marginLeft: "5px", fontSize: "14px" }}>
              {" "}
              mm.
            </strong>
          </div>
          <div style={{ marginTop: "7px" }}>
            <label htmlFor="AfstandVoorzijde" style={labelStyle}>
              <strong> Afstand voorzijde:</strong>
            </label>
            <input
              type="text"
              id="AfstandVoorzijde"
              style={inputStyle}
              value={entry?.afstandVV}
              onChange={(e) =>
                setEntry({ ...entry, afstandVV: e.target.value })
              }
            />
            <strong style={{ marginLeft: "5px", fontSize: "14px" }}>
              {" "}
              mm.
            </strong>
          </div>
          <div style={{ marginTop: "7px" }}>
            <label htmlFor="AfstandAchterzijde" style={labelStyle}>
              <strong> Afstand achterzijde:</strong>
            </label>
            <input
              type="text"
              id="AfstandAchterzijde"
              style={inputStyle}
              value={entry?.afstandVA}
              onChange={(e) =>
                setEntry({ ...entry, afstandVA: e.target.value })
              }
            />
            <strong style={{ marginLeft: "5px", fontSize: "14px" }}>
              {" "}
              mm.
            </strong>
          </div>
          <div style={{ marginTop: "7px" }}>
            <label htmlFor="FlensUitvoering" style={labelStyle}>
              <strong> Flens uitvoering:</strong>
            </label>
            <input
              type="text"
              id="FlensUitvoering"
              style={inputStyle}
              value={selectedFlens}
              onChange={handleChange}
            />
            <span
              onClick={() => handleDropdownClick("Flens")}
              style={{
                padding: "4px",
                border: "1px solid #ccc",
                borderTop: "1px solid #ccc",
                borderRight: "1px solid #ccc",
                borderBottom: "1px solid #ccc",
                borderLeft: "none",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: "13px",
              }}
            >
              ▼
            </span>
            {dropdownOpenFlens && (
              <div
                style={{
                  zIndex: 1,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  marginTop: "2px",
                  maxHeight: "120px",
                  maxWidth: "150px",
                  marginLeft: "150px",
                  overflowY: "auto",
                }}
              >
                {dropdownOptionsFlens.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleDropdownSelect("Flens", option)}
                    style={{
                      padding: "4px",
                      borderBottom: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: "7px" }}>
            <label htmlFor="DikteSchijf" style={labelStyle}>
              <strong> Dikte schijf:</strong>
            </label>
            <input
              type="text"
              id="DikteSchijf"
              style={inputStyle}
              value={entry?.dikte}
              onChange={(e) => setEntry({ ...entry, dikte: e.target.value })}
            />
            <strong style={{ marginLeft: "5px", fontSize: "14px" }}>
              {" "}
              mm.
            </strong>
          </div>
          <div style={{ marginTop: "7px" }}>
            <label style={labelStyle} htmlFor="Koelgaten">
              <strong> Koelgaten:</strong>
            </label>
            <input
              type="checkbox"
              id="Koelgaten"
              style={{ ...checkboxStyle, transform: "scale(1.2)" }}
              checked = {selectedKoelgaten==="JA" ? true : false}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ padding: "3px" }}>
          <label htmlFor="Opmerking" style={labelStyle}>
            <strong>Opmerking:</strong>
          </label>
          <textarea
            style={{
              width: "100%",
              height: "100px",
              border: "1px solid #ccc",
              outline: "none",
              background: "white",
              padding: "10px",
              borderRadius: "3px",
              fontSize: "1rem",
              verticalAlign: "top",
            }}
            id="Opmerking"
            value={entry?.opmerking}
            onChange={(e) => setEntry({ ...entry, opmerking: e.target.value })}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <div style={{ marginRight: "10%" }}>
          <Button
            style={{ marginRight: "50px" }}
            color="primary"
            onClick={() => saveFunction()}
          >
            Opslaan
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default ToevMachine;
