import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProjectRoutingModule } from './project-routing.module';
import { AgreementsComponent } from './agreements/agreements.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { RouterModule } from '@angular/router';
import { AgreementsFormComponent } from './agreements/agreements-form/agreements-form.component';
import { AppGeneralAttachmentModule } from '../general/app-general-attachment/app-general-attachment.module';
import { AuthoritiesFormComponent } from './authorities/authorities-form/authorities-form.component';
import { AuthoritiesListComponent } from './authorities/authorities-list/authorities-list.component';
import { AuthoritiesEvaluationComponent } from './authorities/authorities-evaluation/authorities-evaluation.component';
import { AuthEvaluationGeneralAttachmentListComponent } from './authorities/auth-evaluation-general-attachment-list/auth-evaluation-general-attachment-list.component';
import { EvaluationDialogFormComponent } from './authorities/evaluation-dialog-form/evaluation-dialog-form.component';
import { VolnteerformComponent } from './volunteers/volunteersform/volnteerform.component';
import { VolnteerlistComponent } from './volunteers/volunteersList/volnteerlist.component';
import { ActivitylistComponent } from './Activities/activitieslist/activitylist.component';
import { ActivityformComponent } from './Activities/activitiesform/activityform.component';
import { ProjdefformComponent } from './projectdefinition/projectdefintionform/projdefform.component';
import { ProjdeflistComponent } from './projectdefinition/projectdefinitionlist/projdeflist.component';
import { ProjplansformComponent } from './projectsplans/projectplansForm/projplansform.component';
import { ProjplanslistComponent } from './projectsplans/projectsplansList/projplanslist.component';
import { PprformComponent } from './projectplanrep/projectplanrepform/pprform.component';
import { PprlistComponent } from './projectplanrep/projectplanreplist/pprlist.component';
import { ProjcustomsformComponent } from './projectcustoms/projectcustomsform/projcustomsform.component';
import { ProjcustomslistComponent } from './projectcustoms/projectcusomslist/projcustomslist.component';
import { OrphanFormComponent } from './Orphan/orphan-form/orphan-form.component';
import { OrphanListComponent } from './Orphan/orphan-list/orphan-list.component';
import { ProjarchiveformComponent } from './projectsArchive/projectarchiveForm/projarchiveform.component';
import { ProjarchivelistComponent } from './projectsArchive/projectarchiveList/projarchivelist.component';
import { ProjectArchiveSearchComponent } from './app-projectArchiveSearch/project-archive-search/project-archive-search.component';
import { SocialMediaArchivingListComponent } from './SocialMediaArchiving/social-media-archiving-list/social-media-archiving-list.component';
import { SocialMediaArchivingFormComponent } from './SocialMediaArchiving/social-media-archiving-form/social-media-archiving-form.component';
import { ProjauthadvancedsearchComponent } from '../general/app-searchs/app-projectsAuthAdvancedSearch/projauthadvancedsearch.component';
import { ArgumentadvancedsearchComponent } from '../general/app-searchs/app-projectsArgumentAdvancedSearch/argumentadvancedsearch-component/argumentadvancedsearch.component';
import { AppProjectDefinitionAdvancedSearchComponent } from '../general/app-searchs/app-project-definition-advanced-search/app-project-definition-advanced-search.component';
import { ProjectlogComponent } from './projectsLogReport/projectlog.component';
import { ProjectplanadvancedsearchComponent } from '../general/app-searchs/app-project-plan-advance-search/projectplanadvancedsearch.component';
import { VolunteersadvancedsearchComponent } from '../general/app-searchs/app-VolunteersAdvancedSearch/volunteersadvancedsearch.component';
import { MediacoveragelistComponent } from './MediaCoverage/MediaCoverageList/mediacoveragelist.component';
import { MediacoverageformComponent } from './MediaCoverage/MediaCoverageForm/mediacoverageform.component';
import { CalendarformComponent } from './CalendarCoverage/calendarform.component';
@NgModule({
  declarations: [
    AgreementsComponent,
    AgreementsFormComponent,
    AuthoritiesListComponent,
    AuthoritiesFormComponent,
    AuthoritiesEvaluationComponent,
    AuthEvaluationGeneralAttachmentListComponent,
    EvaluationDialogFormComponent,
    VolnteerformComponent,
    VolnteerlistComponent,
    ActivitylistComponent,
    ActivityformComponent,
    ProjdefformComponent,
    ProjdeflistComponent,
    ProjplansformComponent,
    ProjplanslistComponent,
    PprformComponent,
    PprlistComponent,
    ProjcustomsformComponent,
    ProjcustomslistComponent,
    OrphanListComponent,
    OrphanFormComponent,
    ProjarchiveformComponent,
    ProjarchivelistComponent,
    ProjectArchiveSearchComponent,
    SocialMediaArchivingListComponent,
    SocialMediaArchivingFormComponent,
    ProjauthadvancedsearchComponent,
    ArgumentadvancedsearchComponent,
    AppProjectDefinitionAdvancedSearchComponent,
    ProjectlogComponent,
    ProjectplanadvancedsearchComponent,
    VolunteersadvancedsearchComponent,
    MediacoveragelistComponent,
    MediacoverageformComponent,
    CalendarformComponent
  ],
  providers: [DatePipe],
  imports: [
    CommonModule,
    RouterModule.forChild(ProjectRoutingModule),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxDatatableModule,
    NgApexchartsModule,
    NgxEchartsModule,
    FlexLayoutModule,
    NgChartsModule,
    SharedPipesModule,
    SharedMaterialModule,
    SharedPrimengModule,
    DropdownModule,
    PerfectScrollbarModule,
    AutoCompleteModule,
    MatIconModule,
    TreeTableModule,
    TableModule,
    AppGeneralAttachmentModule,    
  ],
   exports: [ProjectArchiveSearchComponent]
})
export class ProjectModule { }
