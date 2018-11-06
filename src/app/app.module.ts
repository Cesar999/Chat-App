import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatWindowComponent } from './dashboard/chat-window/chat-window.component';
import { SidebarComponent } from './dashboard/sidebar/sidebar.component';

import { RouterModule, Routes } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { AuthGuardService as AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';
import { JwtHelperService,  JwtModule } from '@auth0/angular-jwt';

import {ReactiveFormsModule} from '@angular/forms';

import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from './date.pipe';

const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', component: LoginComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    DashboardComponent,
    ChatWindowComponent,
    SidebarComponent,
    DatePipe
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    HttpModule
  ],
  providers: [CookieService, AuthGuard, AuthService, JwtHelperService],
  bootstrap: [AppComponent]
})
export class AppModule { }
