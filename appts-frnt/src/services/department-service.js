import { myAxios } from "./helper";

export const loadAllDepartments = () => {
  return myAxios.get(`/user/departments`).then((respone) => {
    return respone.data;
  });
};
