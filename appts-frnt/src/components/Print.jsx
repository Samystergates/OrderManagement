import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGreaterThan, faLessThan } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { getCurrentUserDetail, isLoggedIn } from "../auth";
import {
  loadAllSme,
  loadAllSpu,
  loadAllTra,
  printingTraPdf,
  printingMonPdf,
  printingSmePdf,
  printingSpuPdf,
} from "../services/print-service";
import { loadArchivedOrders } from "../services/order-service";
import "../css/print.css";
function Print({ printPanelModal, togglePrintFlowMod, orderX }) {
  const [user, setUser] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [login, setLogin] = useState(null);
  const [smeOrders, setSmeOrders] = useState([]);
  const [spuOrders, setSpuOrders] = useState([]);
  const [traOrders, setTraOrders] = useState([]);
  const [monOrders, setMonOrders] = useState([]);
  const [orderY, setOrderY] = useState([null]);
  const [archOrders, setArchOrders] = useState([null]);
  const [idMapping, setIdMapping] = useState({});

  useEffect(() => {
    setUser(getCurrentUserDetail());
    setLogin(isLoggedIn());
  }, []);

  useEffect(() => {
    if(printPanelModal){
    loadAllSmeOrders();
    loadAllSpuOrders();
    loadAllTraOrders();
    const filteredOrders = orderX.filter(
      (order) => order.monTr === "Y" || order.monLb === "Y"
    );
    setMonOrders(filteredOrders);
    }
  }, [orderX,printPanelModal]);


  useEffect(() => {
    const mergedOrders = [
      ...smeOrders,
      ...spuOrders,
      ...traOrders,
      ...monOrders,
    ];
    const uniqueOrdersSet = new Set();

    const uniqueMergedOrders = mergedOrders.filter((order) => {
      const key = JSON.stringify({
        orderNumber: order?.orderNumber,
        product: order?.product,
      });

      if (!uniqueOrdersSet.has(key)) {
        uniqueOrdersSet.add(key);
        return true;
      }
      return false;
    });

    setOrderY(uniqueMergedOrders);
  }, [smeOrders, spuOrders, traOrders,monOrders]);


  function loadAllSmeOrders() {
    loadAllSme()
      .then((data) => {
        const filteredOrders = orderX.filter((order) =>
          data.some(
            (dataItem) =>
              order.orderNumber === dataItem.orderNumber &&
              order.product === dataItem.prodNumber
          )
        );
        setSmeOrders(filteredOrders);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function loadAllSpuOrders() {
    loadAllSpu()
      .then((data) => {
        const filteredOrders = orderX.filter((order) =>
          data.some(
            (dataItem) =>
              order.orderNumber === dataItem.orderNumber &&
              order.product === dataItem.prodNumber
          )
        );
        setSpuOrders(filteredOrders);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function loadAllTraOrders() {
    loadAllTra()
      .then((data) => {
        const filteredOrders = orderX.filter((order) => {
          const orderIDString = order.id.toString();
          return data.some((dataItem) => {
            if (
              dataItem &&
              dataItem.orderIds &&
              typeof dataItem.orderIds === "string"
            ) {
              const idsArray = dataItem.orderIds.split(",");
              const includesOrderID = idsArray.includes(orderIDString);

              if (includesOrderID) {
                setIdMapping((prevMapping) => ({
                  ...prevMapping,
                  [orderIDString]: dataItem.id,
                }));
              }
              return includesOrderID;
            }
            return false;
          });
        });
        setTraOrders(filteredOrders);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleOrderChange = (event) => {
    setSelectedOrderId(event.target.value);
  };

  function printFunc(dep) {
    const foundOrder = orderY.find((order) => order.id == selectedOrderId);

    const key = `${foundOrder?.orderNumber},${foundOrder?.product}`;
    if (foundOrder) {
    if (dep === "TRA") {
      if (foundOrder?.tra !== "" && foundOrder?.tra !== null) {
        const key = idMapping[selectedOrderId];
        printTra(key);
      }
    }
    if (dep === "SME") {
      if (foundOrder?.sme !== "" && foundOrder?.sme !== null) {
        printSme(foundOrder?.orderNumber+","+foundOrder?.product);
      }
    }
    if (dep === "SPU") {
      if (foundOrder?.spu !== "" && foundOrder?.spu !== null) {
        printSpu(foundOrder?.orderNumber+","+foundOrder?.product);
      }
    }
    if (dep === "MON") {
      if (foundOrder?.monTr === "Y" || foundOrder?.monLb === "Y") {
        printMon(foundOrder?.orderNumber);
      }
    }

      }  }

  function printTra(key) {
    printingTraPdf(key)
      .then((blob) => {
        console.log("working print tra");
        console.log(blob);

        const blobUrl = URL.createObjectURL(blob);

        console.log(URL);
        console.log(blobUrl);

        const link = document.createElement("a");
        console.log(link);
        link.href = blobUrl;
        link.download = "OrderTra ID: " + key + ".pdf";
        link.click();

        URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error("Error fetching or processing PDF:", error);
      });
  }

  function printSme(key) {
    printingSmePdf(key)
      .then((blob) => {
        console.log("working print tra");
        console.log(blob);
        const blobUrl = URL.createObjectURL(blob);

        console.log(URL);
        console.log(blobUrl);
        const link = document.createElement("a");
        
        console.log(link);
        link.href = blobUrl;
        link.download = "OrderSme ID: " + key + ".pdf";
        link.click();

        URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error("Error fetching or processing PDF:", error);
      });
  }

  function printSpu(key) {
    printingSpuPdf(key)
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "OrderSpu ID: " + key + ".pdf";
        link.click();

        URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error("Error fetching or processing PDF:", error);
      });
  }

  function printMon(key) {
    printingMonPdf(key)
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "orderMon ID: "+key+".pdf";
        link.click();

        URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error("Error fetching or processing PDF:", error);
      });
  }

  return (
    <Modal
      isOpen={printPanelModal}
      toggle={togglePrintFlowMod}
      fullscreen
      unmountOnClose
      backdrop="static"
      style={{
        maxWidth: "30%",
        maxHeight: "40%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        left: "35%",
        top: "25%",
      }}
    >
      <ModalHeader toggle={togglePrintFlowMod}>
        <strong>Print Order</strong>
      </ModalHeader>
      <ModalBody>
        <div>
          <select
            className="select-container"
            onChange={handleOrderChange}
            value={selectedOrderId}
          >
            <option value="" disabled>
              - Select Order Number -
            </option>
            {orderY.map((order) => (
              <option key={order?.id} value={order?.id}>
                {`${order?.orderNumber} - ${order?.product}`}
              </option>
            ))}
          </select>

          <hr style={{ margin: "1rem 0" }} />

          <div className="button-container">
            <div className="custom-button" onClick={() => printFunc("TRA")}>
              Print TRA
            </div>
            <div className="custom-button" onClick={() => printFunc("SME")}>
              Print SME
            </div>
            <div className="custom-button" onClick={() => printFunc("SPU")}>
              Print SPU
            </div>
            <div className="custom-button" onClick={() => printFunc("MON")}>
              Print MON
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter></ModalFooter>
    </Modal>
  );
}

export default Print;
