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
            if (typeof Weglot !== 'undefined') {
              Weglot.initialize({
                api_key: '${WEGLOT_CONFIG.apiKey}'
              });
              console.log('Weglot initialized successfully');
            } else {
              console.error('Weglot not available');
            }
          `,
        }}
      />
    </>
  );
}
