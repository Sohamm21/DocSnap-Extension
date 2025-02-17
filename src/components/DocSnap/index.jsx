import React, { useState } from "react";
import Logout from "../Logout";
import CreateNewDoc from "./createNewDoc";
import SelectRecentDoc from "./selectRecentDoc";
import AddNewHeading from "./addNewHeading";
import OpenSelectedDoc from "./openSelectedDoc";
import AddDoc from "./addDoc";

const DocSnapWrapper = () => {
  const [options, setOptions] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <>
      <SelectRecentDoc
        options={options}
        setOptions={setOptions}
        selectedDoc={selectedDoc}
        setSelectedDoc={setSelectedDoc}
      />
      <AddNewHeading selectedDoc={selectedDoc} />
      <AddDoc options={options} setOptions={setOptions} />
      <OpenSelectedDoc selectedDoc={selectedDoc} />
      <CreateNewDoc setOptions={setOptions} />
      <Logout />
    </>
  );
};

export default DocSnapWrapper;
