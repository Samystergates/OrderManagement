import { myAxios } from "./helper";
import { privateAxios } from "./helper";

export const loadAllSme = () => {
  return myAxios
    .get(`/wheels/flow/sme/getAll`)
    .then((response) => response.data);
};

export const loadAllSpu = () => {
  return myAxios
    .get(`/wheels/flow/spu/getAll`)
    .then((response) => response.data);
};

export const loadAllTra = () => {
  return myAxios
    .get(`/transport/route/getAll`)
    .then((response) => response.data);
};

export const printingTraPdf = (key) => {
  return myAxios
  .get(`/transport/route/TRA/printPdf/${key}`, {
    responseType: "blob",
  })
  .then((response) => {
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error("Network response was not ok");
    }
  })
  .catch((error) => {
    console.log(error);
  });
};

export const printingMonPdf = (key) => {
  return myAxios
    .get(`/transport/route/MON/printPdf/${key}`, {
      responseType: "blob",
    })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .catch((error) => {
      console.log(error);
    });
  };

export const printingSmePdf = (key) => {
  return myAxios
    .get(`/wheels/flow/sme/printPdf/${key}`, {
      responseType: "blob",
    })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .catch((error) => {
      console.log(error);
    });
  };

export const printingSpuPdf = (key) => {
  return myAxios
    .get(`/wheels/flow/spu/printPdf/${key}`, {
      responseType: "blob",
    })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .catch((error) => {
      console.log(error);
    });
  };
