import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';  
  cuisines: FirebaseListObservable<any[]>;
  restaurants: Observable<any[]>;
  restaurant;

  constructor(private af: AngularFire) {}

  ngOnInit() {
    this.cuisines = this.af.database.list('/cuisines');
    this.restaurants = this.af.database.list('/restaurants')
      .map(restaurants => {
        console.log("BEFORE MAP", restaurants);
        restaurants.map(restaurant => {
          restaurant.cuisineType = this.af.database.object('cuisines/' + restaurant.cuisine);
        });
        console.log("AFTER MAP", restaurants);
        return restaurants;
      });
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

  remove() {
    this.af.database.object('/restaurant').remove()
      .then(x => console.log("SUCCESS"))
      .catch(error => console.log("ERROR", error));
  }
}
