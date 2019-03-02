import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private router:Router, private auth: AuthService,
              private toastController: ToastController){}

  input_email:string = "";
  input_password:string = "";

  onLogin(){
    if(this.input_email.length!=0 && this.input_password.length!=0){
      this.auth.emailSignIn(this.input_email, this.input_password);

      var x = setInterval(()=>{
        if(this.auth.isLoggedIn()){
          this.auth.getUser().subscribe(user => {
            clearInterval(x);
            if(user.role=="instructor"){
              this.auth.signOut();
              this.presentToast();
            } else {
              this.router.navigate(['courses']);
              this.input_email = "";
              this.input_password = "";
            }
          })
        }
      }, 500);
    }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Instructor is not allowed to use this app.',
      color: "danger",
      duration: 2000
    });
    toast.present();
  }
}
