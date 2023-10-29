import React from "react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { getCurrentUserDetail, isLoggedIn } from "../auth";
import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import { loadAllWheelMachineSize } from "../services/machineSizes-service";
import {
  loadSme,
  deleteSme,
  updateSme,
  saveSme,
} from "../services/sme-service";
import { toast } from "react-toastify";
function SmeModal({ smePanelModal, toggleSmeFlowMod, currSme, toggleFlow }) {
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(null);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadedEntry, setLoadedEntry] = useState(false);
  const [machineSizes, setMachineSizes] = useState([]);
  const [selectedMerk, setSelectedMerk] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [startOrFinish, setStartOrFinish] = useState(false);
  const [entry, setEntry] = useState(null);
  const [selectedDoorgezet, setSelectedDoorgezet] = useState("");
  const [selectedKoelgaten, setSelectedKoelgaten] = useState("");
  const [selectedVerstevigingsringen, setSelectedVerstevigingsringen] =
    useState("");
  const [selectedVentielbeschermer, setSelectedVentielbeschermer] =
    useState("");
  const [selectedWisselsysteem, setSelectedWisselsysteem] = useState("");

  useEffect(() => {
    setUser(getCurrentUserDetail());
    setLogin(isLoggedIn());
    loadMachineSizes();
  }, []);

  useEffect(() => {}, [startOrFinish]);

  useEffect(() => {
    if (currSme) {
      setEntry({
        ...entry,
        orderNumber: currSme?.orderNumber,
        prodNumber: currSme?.product,
      });
      setLoadedEntry(true);
    }
  }, [currSme]);

  useEffect(() => {
    if (loadedEntry) {
      loadOrderSme();
    }
  }, [loadedEntry]);

  useEffect(() => {
    if (selectedRowId !== null) {
      const selectedEntry = machineSizes?.find(
        (item) => item.id === selectedRowId
      );
      setEntry({
        ...selectedEntry,
        orderNumber: currSme?.orderNumber,
        prodNumber: currSme?.product,
      });
      setSelectedDoorgezet(selectedEntry?.doorgezet);
      setSelectedVerstevigingsringen(selectedEntry?.verstevigingsringen);
      setSelectedVentielbeschermer(selectedEntry?.ventielbeschermer);
      setSelectedKoelgaten(selectedEntry?.koelgaten);
      setSelectedWisselsysteem(selectedEntry?.wisselsysteem);
    }
  }, [selectedRowId]);

  function loadOrderSme() {
    if (entry) {
      loadSme(entry)
        .then((data) => {
          setEntry(data);
          setSelectedDoorgezet(data?.doorgezet);
          setSelectedVerstevigingsringen(data?.verstevigingsringen);
          setSelectedVentielbeschermer(data?.ventielbeschermer);
          setSelectedKoelgaten(data?.koelgaten);
          setSelectedWisselsysteem(data?.wisselsysteem);
          if (data.id !== 0) {
            setStartOrFinish(true);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  function saveOrderSme() {
    if (!entry?.merk) {
      toast.error("merk required");
      return;
    }
    saveSme(entry)
      .then((data) => {
        setEntry(data);
        setSelectedDoorgezet(data?.doorgezet);
        setSelectedVerstevigingsringen(data?.verstevigingsringen);
        setSelectedVentielbeschermer(data?.ventielbeschermer);
        setSelectedKoelgaten(data?.koelgaten);
        setSelectedWisselsysteem(data?.wisselsysteem);
        toast.success("Saved Successfully");
        flowMove("R");
        setStartOrFinish(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function flowMove(colorStatus) {
    const smeIndex = currSme?.departments?.findIndex(
      (entry) => entry.depName === "SME"
    );
    if (smeIndex !== -1) {
      const nextEntries = currSme?.departments?.slice(smeIndex + 2);

      const isValidNext = nextEntries.every(
        (entry) =>
          entry.status === "R" || entry.status === "" || entry.status === "B"
      );


      if (isValidNext) {
        toggleFlow("", currSme?.id, "SME", currSme?.sme, "FWD");
      } else {
        toast.error("Complete Previous");
        console.log("error");
      }
    } else {
      console.log("SME not found in departments");
    }
  }

  const smeRemove = () => {
    if (entry?.id > 0) {
      deleteSme(entry?.id)
        .then((data) => {
          setStartOrFinish(false);
          toggleFlow("", currSme?.id, "SME", currSme?.sme, "RVS");
        })
        .catch((error) => {
          console.log(error);
        });
    }
    toggleSmeFlowMod();
  };

  function loadMachineSizes() {
    loadAllWheelMachineSize()
      .then((data) => {
        setMachineSizes([...data]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleChange = (event) => {
    const { id, value } = event.target;
    const isChecked = event.target.checked;
    const val = isChecked ? "JA" : "NEE";
    switch (id) {
      case "Doorgezet":
        setEntry({ ...entry, doorgezet: val });
        setSelectedDoorgezet(val);
        break;
      case "Koelgaten":
        setEntry({ ...entry, koelgaten: val });
        setSelectedKoelgaten(val);
        break;
      case "Verstevigingsringen":
        setEntry({ ...entry, verstevigingsringen: val });
        setSelectedVerstevigingsringen(val);
        break;
      case "Ventielbeschermer":
        setEntry({ ...entry, ventielbeschermer: val });
        setSelectedVentielbeschermer(val);
        break;
      case "Wisselsysteem":
        setEntry({ ...entry, aansluitnippel: val });
        setSelectedWisselsysteem(val);
        break;
      default:
        break;
    }
  };

  const selectModelAndClose = (id) => {
    setSelectedRowId(id);
    toggleModal();
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleButtonClick = () => {
    toggleModal();
  };

  const handleModalClosed = () => {
    clearData();
  };

  const clearData = () => {
    setLoadedEntry(false);
    setSelectedRowId(null);
    setEntry(null);
    setSelectedDoorgezet("");
    setSelectedVerstevigingsringen("");
    setSelectedVentielbeschermer("");
    setSelectedKoelgaten("");
    setSelectedWisselsysteem("");
  };

  const toggleConfirmation = (val) => {
    if (user.departmentsSet[0].depName === "ADMIN") {
      setConfirmationModal(!confirmationModal);
      if (val === "yes") {
        smeRemove();
        toast.success("Removed Successfully");
      } else if (val === "no") {
      }
    } else {
      toast.error("UnAuthorized Department");
    }
  };

  const filteredAndSortedMachineSizes = machineSizes
    .filter((item) => (selectedMerk ? item.merk === selectedMerk : true))
    .sort((a, b) => (a.merk === selectedMerk ? -1 : 1));

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
        isOpen={smePanelModal}
        toggle={toggleSmeFlowMod}
        onClosed={handleModalClosed}
        fullscreen
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
        <ModalHeader toggle={toggleSmeFlowMod}>
          <strong>Toevoegen Smederij Order</strong>
        </ModalHeader>
        <ModalBody>
          <section>
            <h5>OrderData</h5>

            <div className="container">
              <div className="row">
                <div className="col-md-3">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Verkooporder:&nbsp;&nbsp;&nbsp;</strong>{" "}
                    {currSme?.orderNumber}
                  </p>
                </div>
                <div className="col-md-3">
                  {" "}
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Afnemer:&nbsp;&nbsp;</strong> {currSme?.user}
                  </p>
                </div>
                <div className="col-md-3">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Naam:&nbsp;&nbsp;&nbsp;</strong>{" "}
                    {currSme?.customerName}
                  </p>
                </div>
                <div className="col-md-3">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Leverdatum:&nbsp;&nbsp;&nbsp;</strong>{" "}
                    {currSme?.deliveryDate}
                  </p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-3">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Artikelnummer:&nbsp;&nbsp;</strong>{" "}
                    {currSme?.product}
                  </p>
                </div>
                <div className="col-md-3">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Aantal:&nbsp;&nbsp;</strong> {currSme?.aantal}
                  </p>
                </div>
                <div className="col-md-6">
                  <p style={{ fontSize: "1rem" }}>
                    <strong>Omschrijving:&nbsp;&nbsp;</strong>{" "}
                    {currSme?.omsumin}
                  </p>
                </div>
              </div>
            </div>

            <hr style={{ margin: "1rem 0" }} />
          </section>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "74%",
              backgroundColor: "#eeeeee",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                height: "74%",
                backgroundColor: "#eeeeee",
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#eeeeee",
                  overflowX: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field1"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Naafgat:</strong>
                  </label>
                  <input
                    type="text"
                    id="field1"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "48px",
                    }}
                    value={entry?.naafgat}
                    onChange={(e) =>
                      setEntry({ ...entry, naafgat: e.target.value })
                    }
                  />
                  <label
                    htmlFor="field2"
                    style={{
                      marginLeft: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>mm.</strong>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field2"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Skeekcirkel:</strong>
                  </label>
                  <input
                    type="text"
                    id="field2"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "48px",
                    }}
                    value={entry?.steek}
                    onChange={(e) =>
                      setEntry({ ...entry, steek: e.target.value })
                    }
                  />
                  <label
                    htmlFor="field2"
                    style={{
                      marginLeft: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>mm.</strong>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field2"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Aantal boutgaten:</strong>
                  </label>
                  <input
                    type="text"
                    id="field2"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "19px",
                    }}
                    value={entry?.aantalBoutgat}
                    onChange={(e) =>
                      setEntry({ ...entry, aantalBoutgat: e.target.value })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field2"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Verdeling boutgaten:</strong>
                  </label>
                  <input
                    type="text"
                    id="field2"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "0px",
                    }}
                    value={entry?.verdlingBoutgaten}
                    onChange={(e) =>
                      setEntry({ ...entry, verdlingBoutgaten: e.target.value })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field2"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Diameter boutgat:</strong>
                  </label>
                  <input
                    type="text"
                    id="field2"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "17px",
                    }}
                    value={entry?.diameter}
                    onChange={(e) =>
                      setEntry({ ...entry, diameter: e.target.value })
                    }
                  />
                  <label
                    htmlFor="field2"
                    style={{
                      marginLeft: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>mm.</strong>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field2"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Uitvoering boutgat:</strong>
                  </label>
                  <input
                    type="text"
                    id="field2"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "8px",
                    }}
                    value={entry?.typeBoutgat}
                    onChange={(e) =>
                      setEntry({ ...entry, typeBoutgat: e.target.value })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field2"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Maat verzinking</strong>:
                  </label>
                  <input
                    type="text"
                    id="field2"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "27px",
                    }}
                    value={entry?.maatVerzinking}
                    onChange={(e) =>
                      setEntry({ ...entry, maatVerzinking: e.target.value })
                    }
                  />
                  <label
                    htmlFor="field2"
                    style={{
                      marginLeft: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>mm.</strong>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field2"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>ET:</strong>
                  </label>
                  <input
                    type="text"
                    id="field2"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "48px",
                    }}
                    value={entry?.et}
                    onChange={(e) => setEntry({ ...entry, et: e.target.value })}
                  />
                  <label
                    htmlFor="field2"
                    style={{
                      marginLeft: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>mm.</strong>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field2"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Afstand voorzijde:</strong>
                  </label>
                  <input
                    type="text"
                    id="field2"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "17px",
                    }}
                    value={entry?.afstandVV}
                    onChange={(e) =>
                      setEntry({ ...entry, afstandVV: e.target.value })
                    }
                  />
                  <label
                    htmlFor="field2"
                    style={{
                      marginLeft: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>mm.</strong>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field2"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Afstand achterzijde:</strong>
                  </label>
                  <input
                    type="text"
                    id="field2"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "7px",
                    }}
                    value={entry?.afstandVA}
                    onChange={(e) =>
                      setEntry({ ...entry, afstandVA: e.target.value })
                    }
                  />
                  <label
                    htmlFor="field2"
                    style={{
                      marginLeft: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>mm.</strong>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    htmlFor="field2"
                    style={{
                      marginRight: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Dikte schijf:</strong>
                  </label>
                  <input
                    type="text"
                    id="field2"
                    style={{
                      maxWidth: "150px",
                      fontSize: "0.8rem",
                      marginLeft: "48px",
                    }}
                    value={entry?.dikte}
                    onChange={(e) =>
                      setEntry({ ...entry, dikte: e.target.value })
                    }
                  />
                  <label
                    htmlFor="field2"
                    style={{
                      marginLeft: "10px",
                      minWidth: "80px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>mm.</strong>
                  </label>
                </div>
              </div>

              <div
                style={{ flex: 1, padding: "10px", backgroundColor: "#eeeeee" }}
              >
                <div className="card">
                  <div className="card-header">Machine Data</div>
                  <div className="card-body">
                    <div
                      className="form-group"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: "5px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "0.9rem",
                          marginBottom: "5px",
                          marginRight: "10px",
                        }}
                      >
                        Merk:
                      </label>
                      <input
                        type="text"
                        style={{
                          width: "85%",
                          padding: "10px",
                          fontSize: "0.9rem",
                          borderRadius: "3px",
                          border: "1px solid #ccc",
                          height: "40px",
                        }}
                        value={entry?.merk}
                        onChange={(e) =>
                          setEntry({ ...entry, merk: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label
                        style={{ fontSize: "0.9rem", marginBottom: "5px" }}
                      >
                        Type:
                      </label>
                      <input
                        type="text"
                        style={{
                          width: "41%",
                          padding: "10px",
                          fontSize: "0.9rem",
                          marginBottom: "10px",
                          marginLeft: "12px",
                          borderRadius: "3px",
                          height: "40px",
                          border: "1px solid #ccc",
                        }}
                        value={entry?.type}
                        onChange={(e) =>
                          setEntry({ ...entry, type: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        style={{
                          width: "40%",
                          padding: "10px",
                          fontSize: "0.9rem",
                          borderRadius: "3px",
                          border: "1px solid #ccc",
                          height: "40px",
                          marginLeft: "4%",
                        }}
                        value={entry?.model}
                        onChange={(e) =>
                          setEntry({ ...entry, model: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group text-center">
                      <button
                        style={{
                          fontSize: "1rem",
                          padding: "10px 20px",
                          backgroundColor: "grey",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                        }}
                        onClick={handleButtonClick}
                      >
                        Laad...
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "7%" }}>
                  <div style={{ marginBottom: "10px" }}>
                    <input
                      type="checkbox"
                      id="Doorgezet"
                      checked={selectedDoorgezet === "JA" ? true : false}
                      onChange={handleChange}
                      style={{ marginRight: "10px", transform: "scale(1.3)" }}
                    />
                    <label
                      htmlFor="checkbox1"
                      style={{ fontSize: "1.1rem", marginRight: "20px" }}
                    >
                      Doorgezet
                    </label>
                    <input
                      type="checkbox"
                      id="Koelgaten"
                      checked={selectedKoelgaten === "JA" ? true : false}
                      onChange={handleChange}
                      style={{ marginRight: "10px", transform: "scale(1.3)" }}
                    />
                    <label
                      htmlFor="checkbox2"
                      style={{ fontSize: "1.1rem", marginRight: "20px" }}
                    >
                      Koelgaten
                    </label>
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <input
                      type="checkbox"
                      id="Verstevigingsringen"
                      checked={
                        selectedVerstevigingsringen === "JA" ? true : false
                      }
                      onChange={handleChange}
                      style={{ marginRight: "10px", transform: "scale(1.3)" }}
                    />
                    <label
                      htmlFor="checkbox3"
                      style={{ fontSize: "1.1rem", marginRight: "20px" }}
                    >
                      Verstevigingsringen
                    </label>
                    <input
                      type="checkbox"
                      id="Ventielbeschermer"
                      checked={
                        selectedVentielbeschermer === "JA" ? true : false
                      }
                      onChange={handleChange}
                      style={{ marginRight: "10px", transform: "scale(1.3)" }}
                    />
                    <label
                      htmlFor="checkbox4"
                      style={{ fontSize: "1.1rem", marginRight: "20px" }}
                    >
                      Ventielbeschermer
                    </label>
                    <select
                      style={{
                        width: "20%",
                        border: "1px solid #ccc",
                        outline: "none",
                        background: "white",
                        padding: "5px",
                        borderRadius: "3px",
                      }}
                    >
                      <option value="" disabled></option>
                      <option value="option1"></option>
                      <option value="option2"></option>
                      <option value="option3"></option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id="Wisselsysteem"
                      checked={selectedWisselsysteem === "JA" ? true : false}
                      onChange={handleChange}
                      style={{ marginRight: "10px", transform: "scale(1.3)" }}
                    />
                    <label
                      htmlFor="checkbox5"
                      style={{ fontSize: "1.1rem", marginRight: "20px" }}
                    >
                      Aansluitnippel druk/wisselsysteem
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                height: "26%",
                backgroundColor: "#eeeeee",
              }}
            >
              <div style={{ flex: 1, padding: "10px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    <strong>Opmerking:</strong>
                  </label>
                  <textarea
                    rows="3"
                    cols="50"
                    value={entry?.opmerking}
                    onChange={(e) =>
                      setEntry({ ...entry, opmerking: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          {!startOrFinish && (
            <Button color="primary" onClick={() => saveOrderSme()}>
              Opslaan
            </Button>
          )}

          {startOrFinish && currSme?.sme === "R" && (
            <Button color="primary" onClick={() => flowMove("Y")}>
              Start
            </Button>
          )}
          {startOrFinish && currSme?.sme === "Y" && (
            <Button color="primary" onClick={() => flowMove("G")}>
              Finish
            </Button>
          )}

          {currSme?.sme !== "Y" && currSme?.sme !== "G" && (
            <Button color="secondary" onClick={() => toggleConfirmation()}>
              Verwijder
            </Button>
          )}
          {/* <Button color="secondary" onClick={() => toggleConfirmation()}>
              Verwijder
            </Button> */}
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
          <strong>Select Model</strong>
        </ModalHeader>
        <ModalBody>
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
                  onClick={() => selectModelAndClose(item.id)}
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
        <ModalFooter></ModalFooter>
      </Modal>
      <Modal isOpen={confirmationModal} toggle={toggleConfirmation}>
        <ModalBody style={{ justifyContent: "center" }}>
          Remove SME data for Order {entry?.orderNumber}
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
