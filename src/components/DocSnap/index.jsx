import React, { useState } from "react";
import Logout from "../Logout";
import CreateNewDoc from "./createNewDoc";
import SelectRecentDoc from "./selectRecentDoc";

const DocSnapWrapper = ({token, setToken}) => {
  const [options, setOptions] = useState([]);
  return (
    <>
      <CreateNewDoc setOptions={setOptions} />
      <SelectRecentDoc options={options} setOptions={setOptions} />
      <Logout token={token} setToken={setToken} />
    </>
  );
};

export default DocSnapWrapper;
