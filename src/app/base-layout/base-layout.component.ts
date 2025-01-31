import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-base-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.scss'
})
export class BaseLayoutComponent implements OnInit {

  loggedInMessage:string | null = null;
  route = inject(ActivatedRoute)
  router = inject(Router);
  authService = inject(AuthService)

  ngOnInit(): void {
    this.loggedInMessage = this.route.snapshot.queryParamMap.get('message');
    if(this.loggedInMessage !== null && this.loggedInMessage !== undefined){
      setTimeout(() => {
        this.loggedInMessage = null
        this.router.navigate([],{
          relativeTo: this.route
        })
      }, 5000);
    }
  }

  logout(){
    this.authService.logout();
  }
}
