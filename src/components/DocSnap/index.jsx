import React, { useState } from "react";
import Logout from "../Logout";
import CreateNewDoc from "./createNewDoc";
import SelectRecentDoc from "./selectRecentDoc";
import AddNewHeading from "./addNewHeading";

const DocSnapWrapper = () => {
  const [options, setOptions] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <>
      <CreateNewDoc setOptions={setOptions} />
      <SelectRecentDoc options={options} setOptions={setOptions} selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} />
      <AddNewHeading selectedDoc={selectedDoc} />
      <Logout />
    </>
  );
};

export default DocSnapWrapper;
