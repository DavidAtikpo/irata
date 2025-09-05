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
            // Attendre que React soit complètement hydraté avant d'initialiser Weglot
            window.addEventListener('load', function() {
              setTimeout(function() {
                if (typeof Weglot !== 'undefined') {
                  Weglot.initialize({
                    api_key: '${WEGLOT_CONFIG.apiKey}',
                    auto_switch: false,
                    excluded_elements: ['.no-translate', '[data-wg-notranslate]', 'nav', 'header']
                  });
                  console.log('Weglot initialized successfully');
                } else {
                  console.error('Weglot not available');
                }
              }, 1000);
            });
          `,
        }}
      />
    </>
  );
}
