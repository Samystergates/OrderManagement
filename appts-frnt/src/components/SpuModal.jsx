import React from "react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { getCurrentUserDetail, isLoggedIn } from "../auth";
import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import {
  loadSpu,
  deleteSpu,
  updateSpu,
  saveSpu,
} from "../services/spu-service";
import { toast } from "react-toastify";
import carWheelImage from "../image/car-wheel.png";
import carWheelImageWhite from "../image/car-wheel-white.png";
import { loadAllWheelColors } from "../services/wheelColor-service";
function SmeModal({ spuPanelModal, toggleSpuFlowMod, currSpu, toggleFlow }) {
  const [selectedRadio, setSelectedRadio] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(null);
  const [startOrFinish, setStartOrFinish] = useState(false);
  const [wheelColor, setWheelColor] = useState([]);
  const [selectedRalCode, setSelectedRalCode] = useState("");
  const [selectedColorDescription, setSelectedColorDescription] = useState("");
  const [colorEntry, setColorEntry] = useState(null);

  const [checkedNatLakken, setCheckedNatLakkenn] = useState("NEE");
  const [checkedPoedercoaten, setCheckedPoedercoaten] = useState("NEE");
  const [checkedStralen, setCheckedStralen] = useState("NEE");
  const [checkedStralenGedeeltelijk, setCheckedStralenGedeeltelijk] =
    useState("NEE");
  const [checkedSchooperen, setCheckedSchooperen] = useState("NEE");
  const [checkedKitten, setCheckedKitten] = useState("NEE");
  const [checkedPrimer, setCheckedPrimer] = useState("NEE");
  const [checkedOntlakken, setCheckedOntlakken] = useState("NEE");
  const [checkedAflakken, setCheckedAflakken] = useState("NEE");
  const [checkedBlankelak, setCheckedBlankelak] = useState("NEE");
  const [loadedEntry, setLoadedEntry] = useState(false);
  const [loadedEntry2, setLoadedEntry2] = useState(false);
  const [finalEntry, setFinalEntry] = useState(null);

  useEffect(() => {
    setUser(getCurrentUserDetail());
    setLogin(isLoggedIn());
    loadWheelColor();
  }, []);

  useEffect(() => {
    if (currSpu) {
      setFinalEntry({
        ...finalEntry,
        orderNumber: currSpu?.orderNumber,
        prodNumber: currSpu?.product,
      });
      setLoadedEntry(true);
    }
  }, [currSpu]);

  useEffect(() => {
    if (loadedEntry) {
      loadOrderSpu();
    }
  }, [loadedEntry]);

  function loadWheelColor() {
    loadAllWheelColors()
      .then((data) => {
        setWheelColor([...data]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function loadOrderSpu() {
    if (finalEntry) {
      loadSpu(finalEntry)
        .then((data) => {

          setFinalEntry(data);
          setCheckedStralen(data.stralen);
          setCheckedStralenGedeeltelijk(data.stralenGedeeltelijk);
          setCheckedSchooperen(data.schooperen);
          setCheckedKitten(data.kitten);
          setCheckedPrimer(data.primer);
          setCheckedOntlakken(data.ontlakken);
          setCheckedAflakken(data.aflakken);
          setCheckedBlankelak(data.blankeLak);
          setCheckedNatLakkenn(data.natLakken);
          setCheckedPoedercoaten(data.poedercoaten);
          setSelectedRadio(
            data.natLakken === "JA" && data.poedercoaten === "NEE"
              ? "natLakken"
              : data.natLakken === "NEE" && data.poedercoaten === "JA"
              ? "poedercoaten"
              : ""
          );
          const ralCodeString = data.ralCode;
          const ralCodeValues = ralCodeString
            .split(",")
            .map((value) => parseInt(value.trim(), 10));


          const foundColor = wheelColor.find(
            (color) =>
              color.colorName === data.kleurOmschrijving &&
              color.red === ralCodeValues[0] &&
              color.green === ralCodeValues[1] &&
              color.blue === ralCodeValues[2]
          );
          const matchedId = foundColor ? foundColor.id : null;

          setColorEntry((prevEntry) => ({
            ...prevEntry,
            id: matchedId,
            red: ralCodeValues[0] || 0,
            green: ralCodeValues[1] || 0,
            blue: ralCodeValues[2] || 0,
            colorName: data.kleurOmschrijving,
          }));
          if (data.id !== 0) {
            setStartOrFinish(true);
          }
        })
        .catch((error) => {
          console.log("Error in loadSpu:", error);
        });
    }
  }

  function saveOrderSpu() {
    if (!finalEntry?.kleurOmschrijving) {
      toast.error("color name required");
      return;
    }
    saveSpu(finalEntry)
      .then((data) => {
        setFinalEntry(data);
        setCheckedStralen(data.stralen);
        setCheckedStralenGedeeltelijk(data.stralenGedeeltelijk);
        setCheckedSchooperen(data.schooperen);
        setCheckedKitten(data.kitten);
        setCheckedPrimer(data.primer);
        setCheckedOntlakken(data.ontlakken);
        setCheckedAflakken(data.aflakken);
        setCheckedBlankelak(data.blankeLak);
        setCheckedNatLakkenn(data.natLakken);
        setCheckedPoedercoaten(data.poedercoaten);
        setSelectedRadio(
          data.natLakken === "JA" && data.poedercoaten === "NEE"
            ? "natLakken"
            : data.natLakken === "NEE" && data.poedercoaten === "JA"
            ? "poedercoaten"
            : ""
        );
        flowMove("R");
        setStartOrFinish(true);
        toast.success("Saved Successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  }
  function flowMove(colorStatus) {
    const spuIndex = currSpu?.departments?.findIndex(
      (entry) => entry.depName === "SPU"
    );
    if (spuIndex !== -1) {
      const previousEntries = currSpu?.departments?.slice(0, spuIndex);
      const nextEntries = currSpu?.departments?.slice(spuIndex + 1);

      const isValidPrevious = previousEntries.every(
        (entry) =>
          entry.status === "G" ||
          entry.status === "" ||
          (entry.status === "R" && entry.depName === "SME" && currSpu?.spu === "")
      );
      const isValidNext = nextEntries.every(
        (entry) =>
          entry.status === "R" || entry.status === "" || entry.status === "B"
      );

      if (isValidNext && isValidPrevious) {
        toggleFlow("", currSpu?.id, "SPU", currSpu?.spu, "FWD");
      } else {
        toast.error("Complete Previous");
        console.log("error");
      }
    } else {
      console.log("SME not found in departments");
    }
  }

  const spuRemove = () => {
    if (finalEntry?.id > 0) {
      deleteSpu(finalEntry?.id)
        .then((data) => {
          console.log(data);

          setStartOrFinish(false);
          toggleFlow("", currSpu?.id, "SPU", currSpu?.spu, "RVS");
        })
        .catch((error) => {
          console.log(error);
        });
    }
    toggleSpuFlowMod();
  };

  const handleChange = (event) => {
    const { id, value, type } = event.target;
    const isSelected = type === "radio" ? true : event.target.checked;
    const val = isSelected ? "JA" : "NEE";
    switch (id) {
      case "natLakken":
        setFinalEntry({
          ...finalEntry,
          natLakken: val,
          poedercoaten: "NEE",
          stralen: "NEE",
          stralenGedeeltelijk: "NEE",
          schooperen: "NEE",
          kitten: "NEE",
          primer: "NEE",
          ontlakken: "NEE",
          aflakken: "NEE",
          blankeLak: "NEE",
        });
        setCheckedNatLakkenn(val);
        setCheckedStralen("NEE");
        setCheckedStralenGedeeltelijk("NEE");
        setCheckedSchooperen("NEE");
        setCheckedKitten("NEE");
        setCheckedPrimer("NEE");
        setCheckedOntlakken("NEE");
        setCheckedAflakken("NEE");
        setCheckedBlankelak("NEE");
        setSelectedRadio("natLakken");
        break;
      case "poedercoaten":
        setFinalEntry({
          ...finalEntry,
          poedercoaten: val,
          natLakken: "NEE",
          stralen: "NEE",
          stralenGedeeltelijk: "NEE",
          schooperen: "NEE",
          kitten: "NEE",
          primer: "NEE",
          ontlakken: "NEE",
          aflakken: "NEE",
          blankeLak: "NEE",
        });
        setCheckedPoedercoaten(val);
        setCheckedStralen("NEE");
        setCheckedStralenGedeeltelijk("NEE");
        setCheckedSchooperen("NEE");
        setCheckedKitten("NEE");
        setCheckedPrimer("NEE");
        setCheckedOntlakken("NEE");
        setCheckedAflakken("NEE");
        setCheckedBlankelak("NEE");
        setSelectedRadio("poedercoaten");
        break;
      case "Stralen":
        setFinalEntry({ ...finalEntry, stralen: val });
        setCheckedStralen(val);
        break;
      case "StralenGedeeltelijk":
        setFinalEntry({ ...finalEntry, stralenGedeeltelijk: val });
        setCheckedStralenGedeeltelijk(val);
        break;
      case "Schooperen":
        setFinalEntry({ ...finalEntry, schooperen: val });
        setCheckedSchooperen(val);
        break;
      case "Kitten":
        setFinalEntry({ ...finalEntry, kitten: val });
        setCheckedKitten(val);
        break;
      case "Primer":
        setFinalEntry({ ...finalEntry, primer: val });
        setCheckedPrimer(val);
        break;
      case "Ontlakken":
        setFinalEntry({ ...finalEntry, ontlakken: val });
        setCheckedOntlakken(val);
        break;
      case "Aflakken":
        setFinalEntry({ ...finalEntry, aflakken: val });
        setCheckedAflakken(val);
        break;
      case "Blankelak":
        setFinalEntry({ ...finalEntry, blankeLak: val });
        setCheckedBlankelak(val);
        break;
      default:
        break;
    }
  };

  const red = colorEntry?.red || 0;
  const green = colorEntry?.green || 0;
  const blue = colorEntry?.blue || 0;

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

  const toggleConfirmation = (val) => {
    if (user.departmentsSet[0].depName === "ADMIN") {
      setConfirmationModal(!confirmationModal);
      if (val === "yes") {
        spuRemove();
        toast.success("Removed Successfully");
      } else if (val === "no") {
      }
    } else {
      toast.error("UnAuthorized Department");
    }
  };

  const handleModalClosed = () => {
    clearData();
  };

  const clearData = () => {
    setLoadedEntry(false);
    setColorEntry(null);
    setFinalEntry(null);
    setCheckedPoedercoaten("");
    setCheckedStralen("");
    setCheckedStralenGedeeltelijk("");
    setCheckedSchooperen("");
    setCheckedKitten("");
    setCheckedPrimer("");
    setCheckedOntlakken("");
    setCheckedAflakken("");
    setCheckedBlankelak("");
    setSelectedRadio("");
  };

  return (
    <>
      <Modal
        isOpen={spuPanelModal}
        toggle={toggleSpuFlowMod}
        fullscreen
        unmountOnClose
        onClosed={handleModalClosed}
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
        <ModalHeader toggle={toggleSpuFlowMod}>
          <strong>Toevoegen Spuiterij Order</strong>
        </ModalHeader>
        <ModalBody>
          <section>
            <h5 style={{ marginBottom: "20px" }}>OrderData</h5>

            <div className="container">
              <div className="row">
                <div className="col-md-3">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Verkooporder:&nbsp;&nbsp;&nbsp;</strong>{" "}
                    {currSpu?.orderNumber}
                  </p>
                </div>
                <div className="col-md-3">
                  {" "}
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Afnemer:&nbsp;&nbsp;</strong> {currSpu?.user}
                  </p>
                </div>
                <div className="col-md-3">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Naam:&nbsp;&nbsp;&nbsp;</strong>{" "}
                    {currSpu?.customerName}
                  </p>
                </div>
                <div className="col-md-3">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Leverdatum:&nbsp;&nbsp;&nbsp;</strong>{" "}
                    {currSpu?.deliveryDate}
                  </p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-3">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Artikelnummer:&nbsp;&nbsp;</strong>{" "}
                    {currSpu?.product}
                  </p>
                </div>
                <div className="col-md-3">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Aantal:&nbsp;&nbsp;</strong> {currSpu?.aantal}
                  </p>
                </div>
                <div className="col-md-6">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Omschrijving:&nbsp;&nbsp;</strong>{" "}
                    {currSpu?.omsumin}
                  </p>
                </div>
              </div>
            </div>

            <hr style={{ margin: "1rem 0" }} />
          </section>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1fr",
              backgroundColor: "#eeeeee",
              height: "74%",
              gap: "0px",
              padding: "0px",
            }}
          >
            <div
              style={{
                height: "100%",
                padding: "10px",
                borderRadius: "5px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div style={{ marginRight: "10px" }}>
                  <input
                    type="radio"
                    id="natLakken"
                    name="radioGroup"
                    style={{ transform: "scale(1.7)" }}
                    checked={selectedRadio === "natLakken"}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <label
                    htmlFor="natLakken"
                    style={{ marginRight: "10px", fontSize: "1.3rem" }}
                  >
                    Nat Lakken
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div style={{ marginRight: "10px" }}>
                  <input
                    type="radio"
                    id="poedercoaten"
                    name="radioGroup"
                    style={{ transform: "scale(1.7)" }}
                    checked={selectedRadio === "poedercoaten"}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <label htmlFor="poedercoaten" style={{ fontSize: "1.3rem" }}>
                    Poedercoaten
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div style={{ marginRight: "10px" }}>
                  <input
                    type="checkbox"
                    id="Stralen"
                    style={{ transform: "scale(1.7)" }}
                    disabled={selectedRadio !== "natLakken"}
                    checked={checkedStralen === "JA" ? true : false}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <label htmlFor="Stralen" style={{ fontSize: "1.3rem" }}>
                    Stralen
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div style={{ marginRight: "10px" }}>
                  <input
                    type="checkbox"
                    id="StralenGedeeltelijk"
                    style={{ transform: "scale(1.7)" }}
                    disabled={selectedRadio !== "natLakken"}
                    checked={checkedStralenGedeeltelijk === "JA" ? true : false}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <label
                    htmlFor="StralenGedeeltelijk"
                    style={{ fontSize: "1.3rem" }}
                  >
                    Stralen Gedeeltelijk
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id="Schooperen"
                    style={{ marginRight: "7px", transform: "scale(1.7)" }}
                    disabled={selectedRadio !== "natLakken"}
                    checked={checkedSchooperen === "JA" ? true : false}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <label
                    htmlFor="Schooperen"
                    style={{ fontSize: "1.3rem", marginLeft: "7px" }}
                  >
                    Schooperen
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id="Kitten"
                    style={{ marginRight: "7px", transform: "scale(1.7)" }}
                    disabled={selectedRadio !== "poedercoaten"}
                    checked={checkedKitten === "JA" ? true : false}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <label
                    htmlFor="Kitten"
                    style={{ fontSize: "1.3rem", marginLeft: "7px" }}
                  >
                    Kitten
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id="Primer"
                    style={{ marginRight: "7px", transform: "scale(1.7)" }}
                    disabled={selectedRadio !== "natLakken"}
                    checked={checkedPrimer === "JA" ? true : false}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <label
                    htmlFor="Primer"
                    style={{ fontSize: "1.3rem", marginLeft: "7px" }}
                  >
                    Primer
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id="Ontlakken"
                    style={{ marginRight: "7px", transform: "scale(1.7)" }}
                    disabled={selectedRadio !== "poedercoaten"}
                    checked={checkedOntlakken === "JA" ? true : false}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <label
                    htmlFor="Ontlakken"
                    style={{ fontSize: "1.3rem", marginLeft: "7px" }}
                  >
                    Ontlakken
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id="Aflakken"
                    style={{ marginRight: "7px", transform: "scale(1.7)" }}
                    disabled={
                      selectedRadio !== "natLakken" &&
                      selectedRadio !== "poedercoaten"
                    }
                    checked={checkedAflakken === "JA" ? true : false}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <label
                    htmlFor="Aflakken"
                    style={{ fontSize: "1.3rem", marginLeft: "7px" }}
                  >
                    Aflakken
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id="Blankelak"
                    style={{ marginRight: "7px", transform: "scale(1.7)" }}
                    disabled={selectedRadio !== "natLakken"}
                    checked={checkedBlankelak === "JA" ? true : false}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <label
                    htmlFor="Blankelak"
                    style={{ fontSize: "1.3rem", marginLeft: "7px" }}
                  >
                    Blanke lak
                  </label>
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#eeeeee",
                display: "grid",
                gridTemplateRows: "50% 50%",
                height: "100%",
              }}
            >
              <div
                style={{
                  backgroundColor: "#eeeeee",
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ margin: "5px" }}>
                    <strong>Prijscode:</strong>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: "5px",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        flex: "1",
                        marginRight: "5px",
                      }}
                    >
                      <input
                        type="text"
                        value={finalEntry?.prijscode}
                        onChange={(e) =>
                          setFinalEntry({
                            ...finalEntry,
                            prijscode: e.target.value,
                          })
                        }
                        style={{
                          flex: "1",
                          marginRight: "5px",
                          width: "100%",
                          border: "1px solid #ccc",
                          outline: "none",
                          background: "white",
                          padding: "5px",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                  <label style={{ margin: "5px" }}>
                    <strong>Afdeling:</strong>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: "5px",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        flex: "1",
                        marginRight: "5px",
                      }}
                    >
                      <input
                        type="text"
                        value={finalEntry?.afdeling}
                        onChange={(e) =>
                          setFinalEntry({
                            ...finalEntry,
                            afdeling: e.target.value,
                          })
                        }
                        style={{
                          flex: "1",
                          marginRight: "5px",
                          width: "100%",
                          border: "1px solid #ccc",
                          outline: "none",
                          background: "white",
                          padding: "5px",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginRight: "80px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <label style={{ margin: "5px" }}>
                    <strong>Ral Code:</strong>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: "5px",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        flex: "1",
                        marginRight: "5px",
                      }}
                    >
                      <select
                        value={colorEntry ? colorEntry.id : ""}
                        style={{
                          width: "100%",
                          border: "1px solid #ccc",
                          outline: "none",
                          background: "white",
                          padding: "5px",
                          borderRadius: "3px",
                        }}
                        onChange={(e) => {
                          const selectedObject = wheelColor.find(
                            (color) => color.id === parseInt(e.target.value)
                          );
                          setColorEntry(selectedObject);
                          setFinalEntry((prevFinalEntry) => ({
                            ...prevFinalEntry,
                            orderNumber: currSpu?.orderNumber,
                            prodNumber: currSpu?.product,
                            ralCode: `${selectedObject?.red || 0},${
                              selectedObject?.green || 0
                            },${selectedObject?.blue || 0}`,
                            kleurOmschrijving: selectedObject?.colorName,
                          }));
                        }}
                      >
                        <option value=""></option>
                        {wheelColor.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.red},{color.green},{color.blue}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label style={{ margin: "5px" }}>
                    <strong>Kleur Omschrijving:</strong>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: "5px",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        flex: "1",
                        marginRight: "5px",
                      }}
                    >
                      <select
                        value={colorEntry ? colorEntry.id : ""}
                        style={{
                          width: "200px",
                          border: "1px solid #ccc",
                          outline: "none",
                          background: "white",
                          padding: "5px",
                          borderRadius: "3px",
                        }}
                        onChange={(e) => {
                          const selectedObject = wheelColor.find(
                            (color) => color.id === parseInt(e.target.value)
                          );
                          setColorEntry(selectedObject);
                          setFinalEntry((prevFinalEntry) => ({
                            ...prevFinalEntry,
                            orderNumber: currSpu?.orderNumber,
                            prodNumber: currSpu?.product,
                            ralCode: `${selectedObject?.red || 0},${
                              selectedObject?.green || 0
                            },${selectedObject?.blue || 0}`,
                            kleurOmschrijving: selectedObject?.colorName,
                          }));
                        }}
                      >
                        <option value=""></option>
                        {wheelColor.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.colorName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#eeeeee",
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <label style={{ fontSize: "1rem", marginBottom: "5px" }}>
                  <strong>Opmerking:</strong>
                </label>
                <textarea
                  value={finalEntry?.opmerking}
                  onChange={(e) =>
                    setFinalEntry({
                      ...finalEntry,
                      opmerking: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    height: "70%",
                    border: "1px solid #ccc",
                    outline: "none",
                    background: "white",
                    padding: "10px",
                    borderRadius: "3px",
                    fontSize: "1rem",
                    verticalAlign: "top",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                backgroundColor: colorEntry
                  ? `rgba(${colorEntry.red || 0}, ${colorEntry.green || 0}, ${
                      colorEntry.blue || 0
                    })`
                  : "rgba(0, 0, 0)",
                height: "59%",
                borderRadius: "5px",
                position: "relative",
                backgroundSize: "100%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundImage: `url(${backgroundImage})`,
              }}
            ></div>
          </div>
        </ModalBody>
        <ModalFooter>
          {!startOrFinish && (
            <Button color="primary" onClick={() => saveOrderSpu()}>
              Opslaan
            </Button>
          )}
          {startOrFinish && currSpu?.spu === "R" && (
            <Button color="primary" onClick={() => flowMove("Y")}>
              Start
            </Button>
          )}
          {startOrFinish && currSpu?.spu === "Y" && (
            <Button color="primary" onClick={() => flowMove("G")}>
              Finish
            </Button>
          )}

          {currSpu?.spu !== "Y" && currSpu?.spu !== "G" && (
            <Button color="secondary" onClick={() => toggleConfirmation()}>
              Verwijder
            </Button>
          )}
        </ModalFooter>
      </Modal>
      <Modal isOpen={confirmationModal} toggle={toggleConfirmation}>
        <ModalBody style={{ justifyContent: "center" }}>
          Remove SME data for Order {finalEntry?.orderNumber}
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

export default SmeModal;
