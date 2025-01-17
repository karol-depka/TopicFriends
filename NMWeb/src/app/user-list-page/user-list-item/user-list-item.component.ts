import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {UserData, UserProfile, UserProfileService} from 'app/user-profile-shared/user-profile.service';
import {
  MatchResults, SupplyDemandInteractions, SymmetricInteractions, TopicInterest,
  UserInterests,
} from '../../user-profile-shared/user-interests'
import {getDictionaryValuesAsArray} from 'app/shared/utils';
import {TagListModel} from '../../shared/TagListModel'
import {TagInclusions} from '../../shared/TagInclusions'
import { AuthService } from '../../user-profile-shared/auth.service'
import { UserDescriptions } from '../../user-profile-shared/user-descriptions.service'
import {Subject} from 'rxjs/Subject'

import "rxjs/add/operator/takeUntil";

export class SupplyDemandTemplate{
  public static DESIRE_TYPE = {
    SUPPLY: 'supply',
    DEMAND: 'demand',
  };

  desireType: string;
  topics: string;
}

@Component({
  selector: 'nw-user-list-item',
  templateUrl: './user-list-item.component.html',
  styleUrls: ['./user-list-item.component.scss'],
})
export class UserListItemComponent implements OnInit, OnDestroy {

  @Input('userProfile') _userPublicProfile: UserData
  @Input() showLess: boolean;
  userId
  // @Input('userProfile') _userPublicProfile: UserProfile = new UserProfile();

  _whatUserWants: SupplyDemandTemplate[] = [];
  loggedUserInterests: UserInterests;
  loggedUserInterestsSymmetric: SymmetricInteractions;
  loggedUserInterestsSupplyDemand: SupplyDemandInteractions;
  loggedUserId: string;


  userInterests: UserInterests;
  userDescriptions: UserDescriptions;
  profileBasicInfo: UserProfile;
  _expand: boolean;
  supplyDemand
  matchResults: MatchResults

  private unsubscribe = new Subject<void>();

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.authService.user.takeUntil(this.unsubscribe).subscribe((user) => {
      this.loggedUserId = user && user.uid;
    })
    this.userId = this._userPublicProfile.userId
    this.userProfileService.userDataByIdCombined(this.userId).takeUntil(this.unsubscribe).subscribe(x => {
      // console.log('userDataByIdCombined', this.userId, x)
    })
    this.userProfileService.getUserInterestsOnceLoggedIn().takeUntil(this.unsubscribe).subscribe(interests => {
      this.loggedUserInterests = UserInterests.fromJson(interests)
      this.loggedUserInterestsSymmetric =
        this.loggedUserInterests &&
        this.loggedUserInterests.byInteractionMode &&
        this.loggedUserInterests.byInteractionMode.symmetric
      // console.log('loggedUserInterestsSymmetric', this.loggedUserInterestsSymmetric)
      this.loggedUserInterestsSupplyDemand =
        this.loggedUserInterests &&
        this.loggedUserInterests.byInteractionMode &&
        this.loggedUserInterests.byInteractionMode.supplyDemand
      this.calculateMatchScoreIfPossible()
    })
    this._whatUserWants = this._getWhatUserWants();
    this._userPublicProfile.descriptions.takeUntil(this.unsubscribe).subscribe(it => {
      this.userDescriptions = it
    })
    this._userPublicProfile.interests.takeUntil(this.unsubscribe).subscribe(it => {
      this.userInterests = it;
      this.calculateMatchScoreIfPossible()
      // console.log('userPublicProfile.interests.takeUntil(this.unsubscribe).subscribe', it)
      this.supplyDemand =
        this.userInterests &&
        this.userInterests.byInteractionMode &&
        this.userInterests.byInteractionMode.supplyDemand
    });
    this._userPublicProfile.profile.takeUntil(this.unsubscribe).subscribe(it => {
      this.profileBasicInfo = it
    })
  }

  public ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private calculateMatchScoreIfPossible() {
    // TODO: use observeMatchResultsOnceLoggedInWithAnotherUserById
    if ( this.loggedUserInterests && this.userInterests ) {
      this.matchResults = UserInterests.getInterestsMatchWith(this.loggedUserInterests, this.userInterests)
    }
  }

  private _getWhatUserWants(){
    let whatUserWants: SupplyDemandTemplate[] = [];
    if(this._userPublicProfile){
      // let auxObjectJSON = JSON.parse(JSON.stringify(this._userPublicProfile.whatUserWants));
      // let keys: string[] = Object.keys(this._userPublicProfile.whatUserWants);
      // keys.forEach((key: string)=>{
      //   if(auxObjectJSON[key]){
      //     if(auxObjectJSON[key].supply.topics) {
      //       let auxSupplyDemand: SupplyDemandTemplate = new SupplyDemandTemplate();
      //       auxSupplyDemand.desireType = SupplyDemandTemplate.DESIRE_TYPE.SUPPLY;
      //       auxSupplyDemand.topics = auxObjectJSON[key].supply.topics;
      //       whatUserWants.push(auxSupplyDemand);
      //     }
      //     if(auxObjectJSON[key].demand.topics) {
      //       let auxSupplyDemand: SupplyDemandTemplate = new SupplyDemandTemplate();
      //       auxSupplyDemand.desireType = SupplyDemandTemplate.DESIRE_TYPE.DEMAND;
      //       auxSupplyDemand.topics = auxObjectJSON[key].demand.topics;
      //       whatUserWants.push(auxSupplyDemand);
      //     }
      //   }
      // });
    }

    return whatUserWants;
  }

  isLoggedUser() {
    return this.loggedUserId === this.userId;
  }

  shortDescription(description: String, maxLength = 140) {

    if(description && description.length > 140) {
      description = description.slice(0, maxLength) + '...';
    }
    return description;
  }

}
