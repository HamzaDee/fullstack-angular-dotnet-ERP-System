import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import{AppCommonserviceService} from 'app/views/app-commonservice.service';
import { NavigationService } from 'app/shared/services/navigation.service';
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.template.html',
  styleUrls: ['./sidenav.template.scss']
})

export class SidenavComponent implements OnInit{
  @Input('items') public menuItems: any[] = [];
  @Input('hasIconMenu') public hasIconTypeMenuItem: boolean;
  @Input('iconMenuTitle') public iconTypeMenuTitle: string;
  showDash:boolean;

  constructor(public serv: AppCommonserviceService ,private renderer: Renderer2 ,private ser: AppEntryvouchersService,private jwtAuth: JwtAuthService,private navigationService: NavigationService ) { }

  addJsToElement(src: string): HTMLScriptElement {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    this.renderer.appendChild(document.body, script);
    return script;
  }

  ngOnInit() {  
    this.navigationService.menuItems$.subscribe(items => {
    this.menuItems = items; // 🔥 updates automatically
  });

  // subscribe for favourites refresh
  this.serv.getFavouriteRefresh().subscribe(() => {
    this.navigationService.loadMenu(); // reload from DB
  });
  

    let user = this.jwtAuth.getUser()
    this.ser.GetCompName().subscribe(res =>
      {
        debugger
        if(res.companyName == "Billa")
          {
            this.showDash = true;
          }
          else
          {
            this.showDash = false;
          }

      })  
  }

  upscrollmenu(){
    document.querySelector(".menuitem-area").scrollTop -= 20, 1000;
  }
  
  downscrollmenu(){
    document.querySelector(".menuitem-area").scrollTop += 20, 1000;
  }
  viewTilte(id: number) {
    
    $('#title_' + id).addClass('show');

    var scrollPosition = $(window).scrollTop();
    var elementPosition = $('#item_'+ id).offset();
    var elementTop = elementPosition.top - scrollPosition;
    $('#title_' + id).css('top',elementTop +'px');
   
  }

  hideTilte(id: number) {
    $('#title_' + id).removeClass('show');
  }

  viewSideMenu(id: number) {

    $('[id^="sideMenu_"]').css("display", "none");
    $("#sideMenu_" + id).css("display", "block");
    $('[id^="titleSelect_"]').css("display", "none");
    $('#titleSelect_'+id).css("display", "block");

    $('.content').click(function (event) {
      $('[id^="sideMenu_"]').css("display", "none");
      
      
    });

    $('.list-container').click(function (event) {
      $('[id^="sideMenu_"]').css("display", "none");
    });
    
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        $('[id^="sideMenu_"]').css("display", "none");
      }
    });

    var scrollPosition2 = $(window).scrollTop();
    var elementPosition2 = $('#item_'+ id).offset();
    var elementTop2 = elementPosition2.top + scrollPosition2;
    var bottonLocation = $('#sideMenu_'+id).css('height');
    var ValLastLocation =  bottonLocation.slice(0, -2);


    $('[id^="sideMenu_"]').css('top',elementTop2 - parseInt(ValLastLocation) + 40 +'px');
    $('[id^="titleSelect_"]').css('cursor','pointer');
    $('#sideMenu_2000').css('top',100 +'px');

    $('#titleSelect_' + id).addClass('show');

    var scrollPosition = $(window).scrollTop();
    var elementPosition = $('#item_'+ id).offset();
    var elementTop = elementPosition.top - scrollPosition;
    $('#titleSelect_' + id).css('top',elementTop +'px');


  }


  hideSideMenu(id: number) {
    //$("#sideMenu_"+id).css("display","none");
  }
}