import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { JwtHelper } from 'angular2-jwt';
import { AngularFireDatabase, AngularFireList} from 'angularfire2/database';
import { Observable } from 'rxjs';import { map } from 'rxjs/operators';

@Injectable()
export class AuthService {
  // dependent on http service

  usersRef: AngularFireList<any>;
  userSnapshot: Observable<any[]>;

  constructor(private http: Http, public db: AngularFireDatabase) {
      this.usersRef = db.list('/users')
      this.userSnapshot = this.usersRef.snapshotChanges().pipe(map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      }));
    }

  login(credentials) { 
    //post to validate credential
   return this.http.post('/api/authenticate', 
      JSON.stringify(credentials))
      
      //have to return true or false.
      .pipe(map(response => {
        //if matches, return hard coded jwt, returns null if not matches.
        let result = response.json();
        if (result && result.token) {
          //If jwt is truthy, store in local storage.
          localStorage.setItem('token',result.token);
          //and return true, which means mapping response object to boolean
          return true;
        }
      }));
  }

  //should be implemented
  logout() { 
    //if there's no token, it means user logged out
    //check on dev tool, application local storage to validate this function.
    localStorage.removeItem('token');
  }

  //Hide and show blocks according to auth.

  isLoggedIn() { 
    // if the token is not expired, stored in local storage, return true (valid)

    // angular needs angular2-jwt (npm) for this.

    let jwtHelper = new JwtHelper();
    let token = localStorage.getItem('token');
    //check null
    if (!token) {
      return false;
    }

    let expirationDate = jwtHelper.getTokenExpirationDate(token);
    let isExpired = jwtHelper.isTokenExpired(token);

    // console.log("Expiration", expirationDate);
    // console.log("isExpired", isExpired);
    //not expired and not null === user logged in.
    return !isExpired;
  }

  //Jwt has admin info inside, so try to decode that info if token is truthy.
  get currentUser() {
    let token = localStorage.getItem('token');
    if (!token) return null;
    return new JwtHelper().decodeToken(token);
  }

  signUp(credentials) { 
    //post to validate credential
   return this.http.post('/users', 
      JSON.stringify(credentials))
      
      //have to return true or false.
      .pipe(map(response => {
        //if matches, return hard coded jwt, returns null if not matches.
        let result = response.json();
        if (result && result.token) {
          //If jwt is truthy, store in local storage.
          localStorage.setItem('token',result.token);
          //and return true, which means mapping response object to boolean
          return true;
        }
      }));
  }
}

