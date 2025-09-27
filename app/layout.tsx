import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import WeglotScript from "./components/WeglotScript";
import SessionProvider from "./components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CI.DES",
  description: "Formation et certification en accès cordé et travaux en hauteur",
  alternates: {
    languages: {
      'fr': '/',
      'en': '/en',
      'pt': '/pt',
      'de': '/de',
    },
  },
  keywords: [
    "CI.DES",
    "formation",
    "certification",
    "accès cordé",
    "travaux en hauteur",
    "sécurité",
    "IRATA",
    "CQP",
    "formation professionnelle",
    // Investment feature keywords
    "investissement Togo",
    "investir au Togo",
    "financement participatif",
    "crowdfunding Togo",
    "projet au Togo",
    "remboursement investissement",
    "prêt participatif",
    "rendement",
    "opportunités d'investissement Afrique",
    "diaspora togolaise",
  ],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-icon-57x57.png", sizes: "57x57" },
      { url: "/apple-icon-60x60.png", sizes: "60x60" },
      { url: "/apple-icon-72x72.png", sizes: "72x72" },
      { url: "/apple-icon-76x76.png", sizes: "76x76" },
      { url: "/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/apple-icon-180x180.png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/ms-icon-144x144.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialisation Weglot directe
              (function() {
                var script = document.createElement('script');
                script.src = 'https://cdn.weglot.com/weglot.min.js';
                script.onload = function() {
                  if (typeof Weglot !== 'undefined') {
                    Weglot.initialize({
                      api_key: 'wg_e97ec5714272b275569ce52f31c49ce26'
                    });
                    console.log('Weglot initialized from head');
                  }
                };
                document.head.appendChild(script);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <WeglotScript />
        <SessionProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
