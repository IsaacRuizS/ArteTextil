import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-full-layout',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss'],
  imports: [RouterOutlet]
})
export class FullComponent implements OnInit {
  color = 'blue';
  showSettings = false;
  showMinisidebar = false;
  showDarktheme = false;
  showRtl = false;

  public innerWidth: any;

  constructor(public router: Router) { }

  ngOnInit() {
    if (this.router.url === '/') {
      this.router.navigate(['/dashboard/dashboard1']);
    }
    this.handleLayout();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.handleLayout();
  }

  toggleSidebar() {
    this.showMinisidebar = !this.showMinisidebar;
  }

  handleLayout() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 1170) {
      this.showMinisidebar = true;
    } else {
      this.showMinisidebar = false;
    }
  }
}
