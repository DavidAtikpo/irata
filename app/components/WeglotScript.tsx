'use client';

import Script from 'next/script';
import { WEGLOT_CONFIG } from '../../lib/weglot';

export default function WeglotScript() {
  return (
    <>
      <Script
        src="https://cdn.weglot.com/weglot.min.js"
        strategy={WEGLOT_CONFIG.strategy}
      />
      <Script
        id="weglot-init"
        strategy={WEGLOT_CONFIG.strategy}
        dangerouslySetInnerHTML={{
          __html: `
            Weglot.initialize({
              api_key: '${WEGLOT_CONFIG.apiKey}',
              original_language: '${WEGLOT_CONFIG.originalLanguage}',
              destination_languages: ${JSON.stringify(WEGLOT_CONFIG.destinationLanguages)},
              auto_switch: ${WEGLOT_CONFIG.options.autoSwitch},
              show_language_selector: ${WEGLOT_CONFIG.options.showLanguageSelector},
              language_selector_position: '${WEGLOT_CONFIG.options.languageSelectorPosition}',
              excluded_elements: ${JSON.stringify(WEGLOT_CONFIG.options.excludedElements)},
              translate_images: ${WEGLOT_CONFIG.options.translateImages}
            });
          `,
        }}
      />
    </>
  );
}
