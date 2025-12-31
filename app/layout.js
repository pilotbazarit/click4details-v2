import TopProgressBar from "@/components/TopProgressBar";
import LiveChatWidget from "@/components/LiveChatWidget";
import { AppContextProvider } from "@/context/AppContext";
import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import MouseTrail from "@/components/MouseTrail";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata = {
  title: "Pilot Bazar",
  description: "Pilot Bazar - Your one-stop shop for everything",
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${outfit.className} antialiased text-gray-700 debug-screens`}>
        <MouseTrail />
        <Toaster position="top-right" />
        <AppContextProvider>
          <TopProgressBar />
          {children}
          {/* <LiveChatWidget /> */}
        </AppContextProvider>
      </body>
    </html>
  );
}
