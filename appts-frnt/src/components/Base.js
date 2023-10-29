import CustomNavbar from "./CustomNavbar";
import { useEffect } from "react";
import { isLoggedIn } from "../auth";
import { useState } from "react";

const Base = ({ title = "Welcome to app", children, order, searchTerm, handleSearch, moreOptionsCanv , updateFromCRM, toggleConfirmation} ) => {
  const [login, setLogin] = useState(false)
  useEffect(() => {
    setLogin(isLoggedIn())
}, [login])

  return (


<div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
{login && (
  <>
  <div style={{
    //backgroundColor: 'rgb(249, 249, 255)', 
    backgroundColor: '#f5f5f5',
    flex: '0 0 auto', minHeight: '120px'}}>
  
    <CustomNavbar order={order} searchTerm={searchTerm} handleSearch={handleSearch} moreOptionsCanv={moreOptionsCanv} updateFromCRM={updateFromCRM} toggleConfirmation={toggleConfirmation}/>
  
  </div><div style={{margin: '5px',}}></div></>)}

  <div style={{justifyContent: 'center', marginLeft: '0.5%', width: '100%', maxWidth: '99%',
    overflowX: 'auto', overflowY: 'auto', flexGrow: '1'}}>
    {children}
  </div>

  {login && (<div style={{  marginBottom: '0.3%',}}></div>)}
</div>

  );
};

export default Base;
