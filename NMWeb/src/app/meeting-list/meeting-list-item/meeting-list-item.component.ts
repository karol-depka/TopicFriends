import {Component, Input, OnInit} from '@angular/core';
import {MeetingAttendanceByUser, MeetingAttendanceService} from '../meeting-attendance.service';
import {Meeting} from '../../shared/meetings.service';
import {AuthService} from '../../user-profile/auth.service';

@Component({
  selector: 'app-meeting-list-item',
  templateUrl: './meeting-list-item.component.html',
  styleUrls: ['./meeting-list-item.component.scss']
})
export class MeetingListItemComponent implements OnInit {

  @Input() meeting: Meeting;
  meetingAttendanceByUser: MeetingAttendanceByUser;

  constructor(
    private meetingAttendanceService: MeetingAttendanceService,
    private authService: AuthService,
    ) { }

  ngOnInit() {
    this.authService.user.subscribe(user => {
      this.meetingAttendanceService.retrieveUserAttendanceStatus(this.meeting.$key)
        .subscribe((status: MeetingAttendanceByUser) => {
          this.meetingAttendanceByUser = status;
          console.log('MeetingListItemComponent, status.goingStatus: ' + status.going)
        });
    })
    console.log('meeting', this.meeting)
  }
}
