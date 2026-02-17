import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'print/open',
        loadChildren: () => import('./components/print/print.module').then(m => m.PrintModule)
    },
    { path: '', redirectTo: '/print/open/printAdmissionForm', pathMatch: 'full' },
    { path: '**', redirectTo: '/print/open/printAdmissionForm', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: false })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
