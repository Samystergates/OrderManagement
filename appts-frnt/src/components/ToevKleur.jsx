import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGreaterThan, faLessThan } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  saveWheelColor,
  updateWheelColor,
} from "../services/wheelColor-service";
import carWheelImage from "../image/car-wheel.png";
import carWheelImageWhite from "../image/car-wheel-white.png";

import Draggable from "react-draggable";
import { getCurrentUserDetail, isLoggedIn } from "../auth";
function ToevKleur({
  tKPanelModal,
  toggleTKFlowMod,
  wheelColor,
  selectedRowId,
  isWijzigen,
  loadWheelColorProp,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(null);
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);
  const [entry, setEntry] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState({
    errors: {},
    isError: false,
  });

  useEffect(() => {
    setUser(getCurrentUserDetail());
    setLogin(isLoggedIn());

    if (isWijzigen && selectedRowId !== null) {
      const selectedEntry = wheelColor?.find(
        (item) => item.id === selectedRowId
      );
      if (selectedEntry) {
        setEntry(selectedEntry);
        setRed(selectedEntry.red);
        setGreen(selectedEntry.green);
        setBlue(selectedEntry.blue);
      } else {
        setEntry(null);
        setRed(0);
        setGreen(0);
        setBlue(0);
      }
    }
  }, [isWijzigen, selectedRowId, wheelColor]);

  const saveFunction = () => {
    if (!entry?.id) {
      toast.error("Kleur ID is required.");
      return;
    }
    //updateWheelColor
    if (!isWijzigen) {
      const isDuplicateId = wheelColor.some(
        (item) => item.id.toString() === entry.id.toString()
      );
      if (isDuplicateId) {
        toast.error("Kleur ID already exists in the list.");
        return;
      }
      saveWheelColor(entry)
      .then((resp) => {
        toast.success(
          "WheelColor is saved successfully with id " + resp.id
        );
        setEntry({
          id: "",
          colorName: "",
          codeVert: "",
          codePoeder: "",
          red: 0,
          green: 0,
          blue: 0,
        });
        setRed(0);
        setGreen(0);
        setBlue(0);
        loadWheelColorProp();
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
    }else{
      updateWheelColor(entry)
      .then((resp) => {
        toast.success(
          "WheelColor is updated successfully with id " + resp.id
        );
        setEntry({
          id: "",
          colorName: "",
          codeVert: "",
          codePoeder: "",
          red: 0,
          green: 0,
          blue: 0,
        });
        setRed(0);
        setGreen(0);
        setBlue(0);
        loadWheelColorProp();
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


  const isWhiteCombination =
    (red === 0 && green === 0 && blue === 0) ||
    (red === 42 && green === 41 && blue === 42) ||
    (red === 39 && green === 41 && blue === 43) ||
    (red === 14 && green === 14 && blue === 16) ||
    (red === 43 && green === 43 && blue === 44) ||
    (red === 26 && green === 23 && blue === 25) ||
    (red === 48 && green === 50 && blue === 52) ||
    (red <= 40 && green <= 40 && blue <= 40) ||
    (red <= 50 && green <= 40 && blue <= 40) ||
    (red <= 40 && green <= 50 && blue <= 40) ||
    (red <= 40 && green <= 40 && blue <= 50) ||
    (red <= 40 && green <= 40 && blue <= 40);

  const backgroundImage = isWhiteCombination
    ? carWheelImageWhite
    : carWheelImage;

  const handleDrag = (e, ui) => {
    const { x, y } = position;

    if (!e.target || !e.target.parentElement) {
      return;
    }

    const { offsetWidth, offsetHeight } = e.target.parentElement;
    const { innerWidth, innerHeight } = window;

    const maxX = innerWidth - offsetWidth;
    const maxY = innerHeight - offsetHeight;

    const newX = Math.min(Math.max(x + ui.deltaX, 0), maxX);
    const newY = Math.min(Math.max(y + ui.deltaY, 0), maxY);

    if (newX >= 0 && newX <= maxX && newY >= 0 && newY <= maxY) {
      setPosition({ x: newX, y: newY });
    }

    e.stopPropagation();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const parsedValue = parseInt(value, 10);

    // Update the state variables based on the input name
    switch (name) {
      case "red":
        setRed(isNaN(parsedValue) ? 0 : parsedValue);
        setEntry({ ...entry, red: isNaN(parsedValue) ? 0 : parsedValue });
        break;
      case "green":
        setGreen(isNaN(parsedValue) ? 0 : parsedValue);
        setEntry({ ...entry, green: isNaN(parsedValue) ? 0 : parsedValue });
        break;
      case "blue":
        setBlue(isNaN(parsedValue) ? 0 : parsedValue);
        setEntry({ ...entry, blue: isNaN(parsedValue) ? 0 : parsedValue });
        break;
      default:
        break;
    }
  };

  const div1Style = {
    display: "flex",
    width: "130%",
    height: "300px",
    marginRight: "5px",
    flexDirection: "column",
  };

  const div2Style = {
    display: "flex",
    flexDirection: "column",
    width: "70%",
    height: "300px",
    marginRight: "5px",
    paddingLeft: "50px",
  };

  return (
    <Draggable positionOffset={{ x: 0, y: 0 }} handle=".modal-header">
      <Modal
        isOpen={tKPanelModal}
        toggle={toggleTKFlowMod}
        fullscreen
        unmountOnClose
        backdrop="static"
        style={{
          maxWidth: "50%",
          maxHeight: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          left: "25%",
          top: "25%",
        }}
      >
        <ModalHeader toggle={toggleTKFlowMod} className="modal-header">
          <strong>Toevoegen Kleur</strong>
        </ModalHeader>
        <ModalBody>
          <div style={{ display: "flex" }}>
            <div style={div1Style}>
              <label htmlFor="field1">
                <strong>Kleur ID:</strong>
              </label>
              <input
                type="text"
                id="field1"
                style={{ width: "60%" }}
                onKeyPress={(e) => {
                  if (!/[0-9\b]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                value={entry?.id || ""}
                onChange={(e) => setEntry({ ...entry, id: e.target.value })}
                readOnly={isWijzigen}
              />
              <label htmlFor="field2">
                <strong>Kleurnaam:</strong>
              </label>
              <input
                type="text"
                id="field2"
                style={{ width: "60%" }}
                value={entry?.colorName}
                onChange={(e) =>
                  setEntry({ ...entry, colorName: e.target.value })
                }
              />
              <label htmlFor="field3" style={{ marginTop: "50px" }}>
                <strong>Code Vert:</strong>
              </label>
              <input
                type="text"
                id="field3"
                value={entry?.codeVert || ""}
                onChange={(e) =>
                  setEntry({ ...entry, codeVert: e.target.value })
                }
              />
              <label htmlFor="field4">
                <strong>Code Poeder:</strong>
              </label>
              <input
                type="text"
                id="field4"
                value={entry?.codePoeder || ""}
                onChange={(e) =>
                  setEntry({ ...entry, codePoeder: e.target.value })
                }
              />
            </div>
            <div style={div2Style}>
              <label htmlFor="rood">
                <strong>Rood:</strong>
              </label>
              <input
                type="text"
                id="rood"
                name="red"
                value={red}
                onChange={handleChange}
                maxLength="3"
                style={{ width: "80px" }}
              />
              <label style={{ marginTop: "10px" }} htmlFor="groen">
                <strong>Groen:</strong>
              </label>
              <input
                type="text"
                id="groen"
                name="green"
                value={green}
                onChange={handleChange}
                maxLength="3"
                style={{ width: "80px" }}
              />
              <label style={{ marginTop: "10px" }} htmlFor="blauw">
                <strong>Blauw:</strong>
              </label>
              <input
                type="text"
                id="blauw"
                name="blue"
                value={blue}
                onChange={handleChange}
                maxLength="3"
                style={{ width: "80px" }}
              />
            </div>
            <div
              style={{
                width: "100%",
                height: "100px",
                marginRight: "5px",
              }}
            >
              <div
                style={{
                  backgroundColor: `rgb(${red}, ${green}, ${blue})`,
                  height: "280%",
                  padding: "10px",
                  borderRadius: "5px",
                  position: "relative",
                  backgroundSize: "100%",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundImage: `url(${backgroundImage})`,
                }}
              >
              </div>
            </div>
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
    </Draggable>
  );
}

export default ToevKleur;
