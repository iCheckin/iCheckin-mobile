import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface Attendance{
  sid: string;
  uid: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  attendanceCollection: AngularFirestoreCollection<Attendance>;
  attended: Observable<string[]>;

  constructor(private afs: AngularFirestore) { }

  setCollection(uid: string){
    this.attendanceCollection = this.afs.collection('attendance', ref => ref.where('uid', '==', uid));
    this.attended = this.attendanceCollection.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        return a.payload.doc.data().sid;
      })
    }))
  }

  getAttended(){
    return this.attended;
  }

  checkin(uid: string, sid: string, method: string){
    this.afs.collection('attendance').add({sid: sid, uid: uid, method:method, createdAt: new Date()});
  }
}
