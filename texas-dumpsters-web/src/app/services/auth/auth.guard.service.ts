import { Injectable }     from '@angular/core';
import { CanActivate }    from '@angular/router';
import { AuthService }    from './auth.service';
import { Router } from '@angular/router';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {

  }

  canActivate() {
    return new Promise<boolean>((resolve, reject) => {
      let previousSignIn = false;
      if (this.authService.isUserSignedIn()) {
        previousSignIn = true;
      }
      this.authService.getUserProfile().then(userProfile => {
        if (userProfile == null) {
          this.router.navigateByUrl('/auth/signin');
          if (previousSignIn) {
            window.alert('Session expired');
          }
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
