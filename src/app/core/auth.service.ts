

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';

import { Observable, EMPTY } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
// import 'rxjs/add/operator/switchMap';

import { User } from "src/app/model/user";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Observable<User>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router) {

      this.user = this.afAuth.authState.pipe(
        switchMap(user => {
          if (user) {
            // logged in, get custom user from Firestore
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges()
          } else {
            // logged out, null
            return EMPTY;
          }
        })
      )
  }

  getUsers(){
    var docRef = this.afs.collection('users');
    return docRef.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        return a.payload.doc.data();
      })
    }));
  }

  isLoggedIn(){
    var user = this.afAuth.auth.currentUser;
    if(user){
      return true;
    } else {
      return false;
    }
  }

  getUser(){
    return this.user;
  }

  signOut(){
    this.afAuth.auth.signOut();
  }

  emailSignIn(email:string, password: string){
    this.afAuth.auth.signInWithEmailAndPassword(email, password).catch(error => {
      // this.notify.update(error, 'error');
      console.log(error);
    })
  }

  emailSignUp(email: string, password: string, role: string){
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(
        result => {
          // return this.setUserDoc(user, role)
          this.setUserDoc(result.user,role);
          return true;
        }
      )
      .catch(error => {
        // this.notify.update(error, 'error');
        console.log(error);
        return false;
      });


  }

  setUserDoc(user, r){
    const userRef = this.afs.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      role: r
    }

    return userRef.set(data);
  }
}
