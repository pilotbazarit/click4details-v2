import TopProgressBar from "@/components/TopProgressBar";
import LiveChatWidget from "@/components/LiveChatWidget";
import { AppContextProvider } from "@/context/AppContext";
import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import AIChatbotWidget from "@/components/AIChatbot/ChatbotLoader";
import { API_URL } from "@/helpers/apiUrl";
import "./globals.css";
// import MouseTrail from "@/components/MouseTrail";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata = {
  title: "Click4Details - Your one-stop shop for everything",
  description: "Click4Details - Your one-stop shop for everything",
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ],
  },
};

// Google Tag Manager - a supreme admin can set/change the container id
// live from Dashboard > Settings > System Setup (System Setting "gtm"),
// no redeploy needed. process.env.GTM_CODE is the fallback for as long as
// that's unset, so an environment that hasn't touched the new setting yet
// keeps working exactly as before. This is a public, unauthenticated read
// (SystemSettingController::publicGtm) - a GTM container id isn't a
// secret, it's always visible in any site's rendered HTML anyway.
async function getGtmId() {
  try {
    const response = await fetch(`${API_URL}api/system-settings/public/gtm`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return process.env.GTM_CODE;
    }

    const body = await response.json();
    return body?.data?.container_id || process.env.GTM_CODE;
  } catch (error) {
    console.error("getGtmId: falling back to process.env.GTM_CODE -", error?.message);
    return process.env.GTM_CODE;
  }
}

export default async function RootLayout({ children }) {
  const gtmId = await getGtmId();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {gtmId && (
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
      </head>
      <body className={`${outfit.className} antialiased text-gray-700 debug-screens`} suppressHydrationWarning>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {/* <MouseTrail /> */}
        <Toaster position="top-right" />
        <AppContextProvider>
          <TopProgressBar />
          {children}
          {/* <LiveChatWidget /> */}
          <AIChatbotWidget />
        </AppContextProvider>
      </body>
    </html>
  );
}
