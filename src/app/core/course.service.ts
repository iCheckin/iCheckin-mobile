import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { Course } from '../model/course';
import { Enrollment } from '../model/enrollment';

@Injectable({
  providedIn: 'root'
})

export class CourseService {

  user: User;
  coursesCollection: AngularFirestoreCollection<Course>;
  courses: Observable<Course[]>;

  enrollmentCollection: AngularFirestoreCollection<Enrollment>;
  enrollment: Observable<Enrollment[]>;

  constructor(private auth: AuthService, private afs: AngularFirestore) {

    this.enrollmentCollection = this.afs.collection('enrollment');

    this.enrollment = this.enrollmentCollection.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Enrollment;
        return data;
      })
    }));

    this.coursesCollection = this.afs.collection('courses');
    this.courses = this.coursesCollection.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Course;
        data.cid = a.payload.doc.id;
        return data;
      })
    }));
  }

  getCourses(){
    return this.courses;
  }
  getEnrollment(){
    // this.enrollment = this.enrollmentCollection.snapshotChanges().pipe(map(changes => {
    //   return changes.map(a => {
    //     const data = a.payload.doc.data() as Enrollment;
    //     return data;
    //   })
    // }));
    return this.enrollment;
  }

  getCourseById(cid: string){
    var docRef = this.afs.collection('courses').doc(cid);
    return docRef.get().toPromise().then(doc => {
      if(doc.exists){
        const data = doc.data() as Course;
        data.cid = doc.id;
        return data;
      } else {
        console.log('Incorrect course id', 'error');
      }
      return new Course();
    }).catch(error => {
      console.log(error, 'error');
      return new Course();
    });
  }

}
