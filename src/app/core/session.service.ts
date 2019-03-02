import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Session } from '../model/session';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  sessionCollection: AngularFirestoreCollection<Session>;
  session: Observable<Session[]>;

  constructor(private afs: AngularFirestore) { }

  setCollection(cid: string){
    this.sessionCollection = this.afs.collection('session', ref => ref.orderBy('createdAt'));
    this.session = this.sessionCollection.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Session;
        data.sid = a.payload.doc.id;
        return data;
      }).filter(data => data.cid == cid)
    }))
  }

  getSession(){
    return this.session;
  }


}
