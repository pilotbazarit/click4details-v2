import { useRef } from "react";
import { Copy } from 'lucide-react';

const CopyInput = ({product}) => {

const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://pilotbazar.com';
const url = `${domain}/product/${product?.v_slug}`;

  const inputRef = useRef(null);

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand("copy");
      // Optional: Show toast or alert
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="relative flex items-center mt-2">
      <input
        ref={inputRef}
        id="copyLink2"
        type="text"
        placeholder="link"
        value={url}
        readOnly
        className="w-full pr-12 py-2 px-4 rounded-lg border border-gray-300 bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleCopy}
        className="absolute right-4 text-gray-600 hover:text-blue-600"
      >
        <Copy />
      </button>
    </div>
  );
};

export default CopyInput;
