'use client';

import Script from 'next/script';
import { WEGLOT_CONFIG } from '../../lib/weglot';

export default function WeglotScript() {
  return (
    <>
      <Script
        src="https://cdn.weglot.com/weglot.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('Weglot script loaded');
        }}
      />
      <Script
        id="weglot-init"
        strategy={WEGLOT_CONFIG.strategy}
        dangerouslySetInnerHTML={{
          __html: `
            // Initialisation simple de Weglot
            if (typeof Weglot !== 'undefined') {
              Weglot.initialize({
                api_key: '${WEGLOT_CONFIG.apiKey}'
              });
              console.log('Weglot initialized successfully');
            } else {
              // Si Weglot n'est pas encore chargé, attendre
              setTimeout(function() {
                if (typeof Weglot !== 'undefined') {
                  Weglot.initialize({
                    api_key: '${WEGLOT_CONFIG.apiKey}'
                  });
                  console.log('Weglot initialized successfully (delayed)');
                } else {
                  console.error('Weglot not available after timeout');
                }
              }, 2000);
            }
          `,
        }}
      />
    </>
  );
}
