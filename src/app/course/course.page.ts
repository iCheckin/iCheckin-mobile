import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx'
import { Session } from '../model/session';
import { SessionService } from '../core/session.service';
import { AttendanceService } from '../core/attendance.service';
import { User } from '../model/user';
import { AuthService } from '../core/auth.service';
import { CourseService } from '../core/course.service';
import { Course } from '../model/course';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GeohashService } from '../core/geohash.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-course',
  templateUrl: './course.page.html',
  styleUrls: ['./course.page.scss'],
})
export class CoursePage implements OnInit {

  courseId: string;
  course: Course;
  session: Session[];
  user: User;
  attended: string[];


  constructor(private route:ActivatedRoute,
              private barcodeScanner: BarcodeScanner,
              private sessionService: SessionService,
              private attendanceService: AttendanceService,
              private auth: AuthService,
              private courseService: CourseService,
              private geolocation: Geolocation,
              private geohash: GeohashService,
              private alertController: AlertController) { }

  ngOnInit() {

     

    this.auth.getUser().subscribe(usr => {
      this.user = new User;
      this.user.uid = usr.uid;
      this.user.email = usr.email;

      this.courseId = this.route.snapshot.paramMap.get('id');
      this.courseService.getCourseById(this.courseId).then(data => {
        this.course = data as Course;
      })


      this.sessionService.setCollection(this.courseId);
      this.sessionService.getSession().subscribe(data => {
        this.session = data;
      });
      this.attendanceService.setCollection(this.user.uid);
      this.attendanceService.getAttended().subscribe(data => this.attended = data);
    });
  }

  async onCode(){
    var targetSession: Session = this.session[this.session.length-1];
    const alert = await this.alertController.create({
      header: 'Enter word of the day',
      inputs: [
        {
          name: 'code',
          type: 'text',
          placeholder: 'Wednesdaywoo'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            // console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            var iActive = targetSession.isActive;
            this.geolocation.getCurrentPosition().then((resp) => {
                var gHash:string = this.geohash.encode(resp.coords.latitude, resp.coords.longitude, 7);
                if(iActive && data.code==targetSession.keyword && targetSession.location==gHash){
                  console.log("success!")
                  this.attendanceService.checkin(this.user.uid, targetSession.sid, "code");
                }
        
             }).catch((error) => {
               console.log('Error getting location', error);
             });
          }
        }
      ]
    });
    await alert.present();
  }

  onScan(){
    var targetSession: Session = this.session[this.session.length-1];
    var iActive: boolean = targetSession.isActive;

    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.geolocation.getCurrentPosition().then((resp) => {
        var gHash: string = this.geohash.encode(resp.coords.latitude, resp.coords.longitude, 7);
        if(iActive && barcodeData.text==targetSession.sid && targetSession.location==gHash){
          this.attendanceService.checkin(this.user.uid, targetSession.sid, "QR");
        }
      })
    }).catch(err => {
      console.log('error', err);
    });
  }




}
