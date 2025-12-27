import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
    <div style="text-align:center">
      <h1>
        Welcome to {{ title }}!
      </h1>
      <p>This is the legacy Angular application for rendering Document Templates.</p>
    </div>
  `,
    styles: []
})
export class AppComponent {
    title = 'document-template-angular';
}
