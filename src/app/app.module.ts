import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2';

import { AppComponent } from './app.component';

export const firebaseConfig = {
    apiKey: "AIzaSyA3gLvJjnDuNQiTX8h3BoXnIN3qS37sECA",
    authDomain: "hello-angular-fire.firebaseapp.com",
    databaseURL: "https://hello-angular-fire.firebaseio.com",
    projectId: "hello-angular-fire",
    storageBucket: "hello-angular-fire.appspot.com",
    messagingSenderId: "498914816395"
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
