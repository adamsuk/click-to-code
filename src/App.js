import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';

const CodeEditorWithGaps = () => {
    const editorRef = useRef(null);
    const viewRef = useRef(null);
    const [output, setOutput] = useState("");

    useEffect(() => {
        if (editorRef.current && !viewRef.current) {
            const startState = EditorState.create({
                doc: "// Click the buttons to complete the code\n___gap___\n___gap___",
                extensions: [javascript()],
            });

            viewRef.current = new EditorView({
                state: startState,
                parent: editorRef.current,
            });
        }

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, []);

    const fillGap = (snippet) => {
        if (viewRef.current) {
            const currentDoc = viewRef.current.state.doc;
            const gapIndex = currentDoc.toString().indexOf("___gap___");

            if (gapIndex !== -1) {
                const transaction = viewRef.current.state.update({
                    changes: { from: gapIndex, to: gapIndex + "___gap___".length, insert: snippet }
                });

                viewRef.current.dispatch(transaction);
            }
        }
    };

    const runCode = () => {
        setOutput('')
        if (viewRef.current) {
            const userCode = viewRef.current.state.doc.toString();
            try {
                const log = console.log;
                console.log = (message) => setOutput(prev => prev + message + '\n');
                new Function(userCode)();
                console.log = log;
            } catch (e) {
                setOutput(`Error in code: ${e.message}`);
            }
        }
    };

    return (
        <div>
            <button onClick={() => fillGap("console.log('Hello World!');")}>Fill with 'Hello World'</button>
            <button onClick={() => fillGap("let x = 5;")}>Fill with 'let x = 5'</button>
            <button onClick={runCode}>Run Code</button>
            <div ref={editorRef}></div>
            <div>
                <h3>Output:</h3>
                <pre>{output}</pre>
            </div>
        </div>
    );
};

export default CodeEditorWithGaps;
