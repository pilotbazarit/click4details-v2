"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const JoditReact = dynamic(() => import("jodit-react").then((mod) => mod.default), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const JoditEditor = ({ value, onBlur, placeholder }) => {
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || "Start typing...",
      height: 250,
      toolbar: true,
      buttons: ["bold", "italic", "underline", "strikethrough", "|", "eraser", "|", "hr", "link", "|", "indent", "outdent", "align", "brush"],
    }),
    []
  );

  return <JoditReact value={value} onBlur={onBlur} config={config} />;
};

export default JoditEditor;
