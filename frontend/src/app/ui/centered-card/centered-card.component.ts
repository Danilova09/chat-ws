import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-centered-card',
  templateUrl: './centered-card.component.html',
  styleUrls: ['./centered-card.component.sass']
})
export class CenteredCardComponent {
  @Input() title = '';
}
