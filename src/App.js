import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, Decoration, ViewPlugin } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import './CodeEditorWithGaps.css'; // Make sure to import the CSS

const CodeEditorWithGaps = () => {
    const editorRef = useRef(null);
    const viewRef = useRef(null);
    const [output, setOutput] = useState("");

    // Define a style for the gap
    const gapStyle = Decoration.mark({
        attributes: { class: "gap-style" }
    });

    // Create a plugin to apply the gap style to all occurrences of "___gap___"
    const gapPlugin = ViewPlugin.fromClass(class {
        decorations = Decoration.none;

        constructor(view) {
            this.decorations = this.createDecorations(view);
        }

        update(update) {
            if (update.docChanged) {
                this.decorations = this.createDecorations(update.view);
            }
        }

        createDecorations(view) {
            const decorations = [];
            const doc = view.state.doc;
            let pos = 0;
            while ((pos = doc.toString().indexOf("___gap___", pos)) !== -1) {
                decorations.push(gapStyle.range(pos, pos + "___gap___".length));
                pos += "___gap___".length;
            }
            return Decoration.set(decorations);
        }
    }, {
        decorations: v => v.decorations
    });

    useEffect(() => {
        if (editorRef.current && !viewRef.current) {
            const startState = EditorState.create({
                doc: "// Click the buttons to complete the code\nconst x = ___gap___\nconst y = ___gap___\nconsole.log(`${x}, ${y}`)",
                extensions: [
                    javascript(),
                    gapPlugin,
                    EditorState.readOnly.of(true)  // Make the editor read-only
                ],
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
        setOutput('');
        if (viewRef.current) {
            const userCode = viewRef.current.state.doc.toString().replace(/___gap___/g, '');
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
            <button onClick={() => fillGap("'Hello World!'")}>Fill with 'Hello World'</button>
            <button onClick={() => fillGap("'Erm... Hello'")}>Fill with 'Erm... Hello'</button>
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
