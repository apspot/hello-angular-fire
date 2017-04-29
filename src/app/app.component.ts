import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

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
  exists;

  constructor(private af: AngularFire) {}

  ngOnInit() {
    this.cuisines = this.af.database.list('/cuisines', {
      query: {
        orderByValue: true //add this to Firebase Console -> Rules: "cuisines": { ".indexOn": ".value" }
      }
    });

    this.restaurants = this.af.database.list('/restaurants', {
      query: {
        orderByChild: 'rating', //we filter this property
        startAt: 3, //add this to Firebase Console -> Rules: "restaurants": { ".indexOn": ["rating", "address/city"] }
        endAt: 5,
        limitToFirst: 10 //or limitToLast
      }
    })
      .map(restaurants => {
        console.log("BEFORE MAP", restaurants);
        restaurants.map(restaurant => {
          restaurant.cuisineType = this.af.database.object('cuisines/' + restaurant.cuisine);
          restaurant.featureTypes = [];
          for (var f in restaurant.features)
            restaurant.featureTypes.push(this.af.database.object('/features/' + f))
        });
        console.log("AFTER MAP", restaurants);
        return restaurants;
      });

    this.restaurant = this.af.database.object('/restaurant');

    this.exists = this.af.database.object('/restaurants/1/features/1');
    this.exists.take(1).subscribe(x => { //take(1): unsubscribes automatically after the first result
      if (x && x.$value) console.log("EXISTS")
      else console.log("NOT EXISTS");
    });
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
