import React from "react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { getCurrentUserDetail, isLoggedIn } from "../auth";
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import TransportModal from "./TransportModal";
import ZoekKleur from "./ZoekKleur";
import ZoekMachine from "./ZoekMachine";
import Print from "./Print";

function NavCanv({ isMoreOptionsCanv, moreOptionsCanv, updateForTra, orderX , toggleFlowTra}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(null);
  const [transportPanelModal, setTransportPanelModal] = useState(false);
  const [zKPanelModal, setZKPanelModal] = useState(false);
  const [zMPanelModal, setZMPanelModal] = useState(false);
  const [printPanelModal, setPrintPanelModal] = useState(false);
  const [orderY, setOrderY] = useState([]);

  useEffect(() => {
    setUser(getCurrentUserDetail());
    setLogin(isLoggedIn());
    setSelectedDate(getNextWorkingDay());
  }, []);

  useEffect(() => {
    const filteredArray = orderX.filter(item => item.isParent === 1);
    setOrderY(filteredArray);
  }, [orderX]);

  const toggleTraFlowMod = () => {
    setTransportPanelModal(!transportPanelModal);
  };

  const toggleZKFlowMod = () => {
    setZKPanelModal(!zKPanelModal);
  };
  const toggleZMFlowMod = () => {
    setZMPanelModal(!zMPanelModal);
  };

  const togglePrintFlowMod = () => {
    setPrintPanelModal(!printPanelModal);
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

  return (
    <Offcanvas
      direction="end"
      isOpen={isMoreOptionsCanv}
      toggle={moreOptionsCanv}
    >
      <OffcanvasHeader toggle={moreOptionsCanv}></OffcanvasHeader>
      <OffcanvasBody>
        <div onClick={toggleTraFlowMod} className="nav-item-OffC">
          <span>
            Transport Order
            <TransportModal
              transportPanelModal={transportPanelModal}
              toggleTraFlowMod={toggleTraFlowMod}
              updateForTra={updateForTra}
              orderX={orderX}
              orderY={orderY}
              toggleFlowTra={toggleFlowTra}
            />
          </span>
        </div>
        <div onClick={toggleZMFlowMod} className="nav-item-OffC">
          <span>
            Zoek Machine gegevens
            <ZoekMachine
              zMPanelModal={zMPanelModal}
              toggleZMFlowMod={toggleZMFlowMod}
            />
          </span>
        </div>
        <div onClick={toggleZKFlowMod} className="nav-item-OffC">
          <span>
            Zoek Kleur gegevens
            <ZoekKleur
              zKPanelModal={zKPanelModal}
              toggleZKFlowMod={toggleZKFlowMod}
            />
          </span>
        </div>
        <div onClick={togglePrintFlowMod} className="nav-item-OffC">
          <span>
            Print Order
            <Print
              printPanelModal={printPanelModal}
              togglePrintFlowMod={togglePrintFlowMod}
              orderX={orderX}
            />
          </span>
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}

export default NavCanv;
