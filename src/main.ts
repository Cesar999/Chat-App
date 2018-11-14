import { enableProdMode, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

if (localStorage.getItem('locale') === null) {
  if(navigator.language.split('-')[0] === 'es'){
    localStorage.setItem('locale', 'es');
  } else {
    localStorage.setItem('locale', 'en');
  }
}

  console.log(navigator.language.split('-')[0]);

  const locale = localStorage.getItem('locale');
  declare const require;
  const translations = require(`raw-loader!../src/locale/messages.${locale}.xlf`);
  platformBrowserDynamic().bootstrapModule(AppModule, {
    providers: [
      {provide: TRANSLATIONS, useValue: translations},
      {provide: TRANSLATIONS_FORMAT, useValue: 'xlf'}
    ]
  });

