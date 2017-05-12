import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable, AuthProviders, AuthMethods } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Http } from '@angular/http';

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
  displayName;
  photoURL;

  constructor(private af: AngularFire, private http: Http) {}

  ngOnInit() {
    this.af.auth.subscribe(authState => {
      if (!authState) {
        console.log("NOT LOGGED IN");
        this.displayName = null;
        this.photoURL = null;
        return;
      }
      console.log("LOGGED IN", authState);      
      this.displayName = authState.auth.displayName;
      this.photoURL = authState.auth.photoURL;
      let userRef = this.af.database.object('/users/' + authState.uid);
      if (authState.facebook) {
        userRef.subscribe(user => {
          let url = `https://graph.facebook.com/v2.9/${authState.facebook.uid}?fields=id,first_name,last_name,email,gender&access_token=${user.accessToken}`;
          this.http.get(url).subscribe(response => {
            let user = response.json();
            userRef.update({
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              gender: user.gender
            });
          });        
        });
      }
    });

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

  login() {
    this.af.auth.login({
      provider: AuthProviders.Facebook,      
      method: AuthMethods.Popup,
      scope: ['public_profile', 'user_friends'] //developer.facebook.com -> app review in the left menu -> approved items
    }).then((authState: any) => { //must be Any to ignore accessToken not found error
      console.log("AFTER LOGIN", authState); //this code will be executed only with AuthMethods.Popup because redirect leaves the app
      this.af.database.object('/users/' + authState.uid).update({
        accessToken: authState.facebook.accessToken //we will use this to call Graph API
      });
    });
  }

  logout() {
    this.af.auth.logout();
  }

  register() {
    this.af.auth.createUser({
      email: 'apspot01@gmail.com',
      password: 'alma1234'
    })
    .then(authState => { 
      console.log('REGISTER-THEN', authState);
      authState.auth.sendEmailVerification(); //email text can be changed in Firebase Console -> authentication -> email templates
    })
    .catch(error => console.log('REGISTER-ERROR', error));
  }

  loginWithEmail() {
    this.af.auth.login({
      email: 'apspot01@gmail.com',
      password: 'alma1234'
    }, {
      method: AuthMethods.Password,
      provider: AuthProviders.Password
    })
    .then(authState => { console.log("LOGIN-THEN", authState) })
    .catch(error => { console.log("LOGIN-ERROR", error) });
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

  addRestaurant() {
    this.af.database.list('/restaurants').push({}) //we create the objects in then, push is just to get a key
      .then(x => {
        let restaurant = { name: 'My new restaurant' };
        let update = {};
        update['restaurants/' + x.key] = restaurant; //set to null to remove the object from the DB
        update['restaurants-by-city/camberwell/' + x.key] = restaurant; //set to null to remove the object from the DB
        this.af.database.object('/').update(update);
      });
  }
}
