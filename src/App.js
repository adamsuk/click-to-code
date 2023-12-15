import React, { useState } from "react";
import { Controlled as ControlledEditor } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";

function CodeEditor() {
  const [code, setCode] = useState(
    "// Click on the elements above to fill gaps\n___gap___\n___gap___"
  );

  const insertCode = (snippet) => {
    setCode((currentCode) => currentCode.replace("___gap___", snippet));
  };

  return (
    <div>
      <div
        className="clickable"
        onClick={() => insertCode("console.log('Hello');")}
      >
        console.log('Hello');
      </div>
      <div className="clickable" onClick={() => insertCode("let x = 10;")}>
        let x = 10;
      </div>

      <ControlledEditor
        value={code}
        options={{
          mode: "javascript",
          lineNumbers: true,
        }}
        onBeforeChange={(editor, data, value) => setCode(value)}
      />
      <div id="code">{code}</div>
    </div>
  );
}

export default CodeEditor;
