import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  cuisines: FirebaseListObservable<any[]>;
  restaurant;

  constructor(private af: AngularFire) {}

  ngOnInit() {
    this.cuisines = this.af.database.list('/cuisines');
    this.restaurant = this.af.database.object('/restaurant');
  }

  add() {
    this.cuisines.push({
      name: 'Asian',
      details: {
        description: '...'
      }
    });
  }

  update() {
    this.af.database.object('/restaurant').update({
      name: 'New name',
      rating: 5
    });
  }

  set() {
    this.af.database.object('/restaurant').set({
      name: 'Newer name',
      rating: 4
    });
  }

  setToNull() {
    this.af.database.object('/restaurant').set(null);
  }
}
