import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../model/user';
import { AuthService } from '../core/auth.service';
import { Enrollment } from '../model/enrollment';
import { Course } from '../model/course';
import { CourseService } from '../core/course.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
})
export class CoursesPage implements OnInit {
  user:User = new User();
  enrollment: string[];
  courses: Course[];

  color = ['#4285F4', '#0F9D58', '#DB4437', '#F4B400']

  constructor(private router:Router, private auth: AuthService,
              private courseService: CourseService) { }

  ngOnInit() {
    this.user.email = "_";
    this.auth.getUser().subscribe( user => {
      this.user.uid = user.uid;
      this.user.email = user.email;
      this.user.role = user.role;
    });
    
    this.courseService.getEnrollment().subscribe(
      data => {
       this.enrollment = [];
       for(var i = 0; i < data.length; ++i){
         this.enrollment.push(data[i].cid);
       }
       
       this.courseService.getCourses().subscribe(data => {
        this.courses = data.filter( course => this.enrollment.includes(course.cid));
       });
      });
  }

  onCard(cid:string){
    this.router.navigate(['course', cid]);
  }

  onLogout(){
    this.auth.signOut();
    this.router.navigate(['home']);
  }

}
