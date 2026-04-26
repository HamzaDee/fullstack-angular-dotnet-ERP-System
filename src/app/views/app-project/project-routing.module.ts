
import {  Routes } from '@angular/router';
import { AgreementsComponent } from './agreements/agreements.component';
import { config } from 'config';
import { AgreementsFormComponent } from './agreements/agreements-form/agreements-form.component';
import { AuthoritiesFormComponent } from './authorities/authorities-form/authorities-form.component';
import { AuthoritiesListComponent } from './authorities/authorities-list/authorities-list.component';
import { VolnteerformComponent } from './volunteers/volunteersform/volnteerform.component'; 
import { VolnteerlistComponent } from './volunteers/volunteersList/volnteerlist.component';
import { ActivitylistComponent } from './Activities/activitieslist/activitylist.component';
import { ActivityformComponent } from './Activities/activitiesform/activityform.component';
import { ProjdeflistComponent } from './projectdefinition/projectdefinitionlist/projdeflist.component';
import { ProjdefformComponent } from './projectdefinition/projectdefintionform/projdefform.component';
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
import { SocialMediaArchivingListComponent } from './SocialMediaArchiving/social-media-archiving-list/social-media-archiving-list.component';
import { SocialMediaArchivingFormComponent } from './SocialMediaArchiving/social-media-archiving-form/social-media-archiving-form.component';
import { ProjectlogComponent } from './projectsLogReport/projectlog.component';
import { MediacoveragelistComponent } from './MediaCoverage/MediaCoverageList/mediacoveragelist.component';
import { MediacoverageformComponent } from './MediaCoverage/MediaCoverageForm/mediacoverageform.component';
import { CalendarformComponent } from './CalendarCoverage/calendarform.component';

export const ProjectRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'AgreementsList',
          component: AgreementsComponent,
          data: { title: 'AgreementsList', breadcrumb: 'AgreementsList', roles: config.authRoles.sa }
        },
        {
          path: 'AgreementsForm',
          component: AgreementsFormComponent,
          data: { title: 'AgreementsForm', breadcrumb: 'AgreementsForm', roles: config.authRoles.sa }
        },
        {
          path: 'AuthoritiesList',
          component: AuthoritiesListComponent,
          data: { title: 'AuthoritiesList', breadcrumb: 'AuthoritiesList', roles: config.authRoles.sa }
        },
        {
          path: 'AuthoritiesForm',
          component: AuthoritiesFormComponent,
          data: { title: 'AuthoritiesForm', breadcrumb: 'AuthoritiesForm', roles: config.authRoles.sa }
        },
        {
          path: 'Volnteerlist',
          component: VolnteerlistComponent,
          data: { title: 'Volnteerlist', breadcrumb: 'Volnteerlist', roles: config.authRoles.sa }
        },
        {
          path: 'Volnteerform',
          component: VolnteerformComponent,
          data: { title: 'Volnteerform', breadcrumb: 'Volnteerform', roles: config.authRoles.sa }
        },
        {
          path: 'Activitylist',
          component: ActivitylistComponent,
          data: { title: 'Activitylist', breadcrumb: 'Activitylist', roles: config.authRoles.sa }
        },
        {
          path: 'Activityform',
          component: ActivityformComponent,
          data: { title: 'Activityform', breadcrumb: 'Activityform', roles: config.authRoles.sa }
        },
        {
          path: 'ProjectDefinitionList',
          component: ProjdeflistComponent,
          data: { title: 'ProjectDefinitionList', breadcrumb: 'ProjectDefinitionList', roles: config.authRoles.sa }
        },
        {
          path: 'ProjectDefinitionForm',
          component: ProjdefformComponent,
          data: { title: 'ProjectDefinitionForm', breadcrumb: 'ProjectDefinitionForm', roles: config.authRoles.sa }
        },
        {
          path: 'ProjectPlansList',
          component: ProjplanslistComponent,
          data: { title: 'ProjectPlansList', breadcrumb: 'ProjectPlansList', roles: config.authRoles.sa }
        },
        {
          path: 'ProjectPlansForm',
          component: ProjplansformComponent,
          data: { title: 'ProjectPlansForm', breadcrumb: 'ProjectPlansForm', roles: config.authRoles.sa }
        },
        {
          path: 'ProjectPlansRepList',
          component: PprlistComponent,
          data: { title: 'ProjectPlansRepList', breadcrumb: 'ProjectPlansRepList', roles: config.authRoles.sa }
        },
        {
          path: 'ProjectPlansRepForm',
          component: PprformComponent,
          data: { title: 'ProjectPlansRepForm', breadcrumb: 'ProjectPlansRepForm', roles: config.authRoles.sa }
        },
        {
          path: 'ProjectCustomsList',
          component: ProjcustomslistComponent,
          data: { title: 'ProjectCustomsList', breadcrumb: 'ProjectCustomsList', roles: config.authRoles.sa }
        },
        {
          path: 'ProjectCustomsForm',
          component: ProjcustomsformComponent,
          data: { title: 'ProjectCustomsForm', breadcrumb: 'ProjectCustomsForm', roles: config.authRoles.sa }
        },
        {
          path: 'OrphanList',
          component: OrphanListComponent,
          data: { title: 'OrphanList', breadcrumb: 'OrphanList', roles: config.authRoles.sa }
        },
        {
          path: 'OrphanForm',
          component: OrphanFormComponent,
          data: { title: 'OrphanForm', breadcrumb: 'OrphanForm', roles: config.authRoles.sa }
        },        
        {
          path: 'ProjectArchiveList',
          component: ProjarchivelistComponent,
          data: { title: 'ProjectArchiveList', breadcrumb: 'ProjectArchiveList', roles: config.authRoles.sa }
        },
        {
          path: 'ProjectArchiveForm',
          component: ProjarchiveformComponent,
          data: { title: 'ProjectArchiveForm', breadcrumb: 'ProjectArchiveForm', roles: config.authRoles.sa }
        },        
        {
          path: 'SocialMediaArchivingList',
          component: SocialMediaArchivingListComponent,
          data: { title: 'SocialMediaArchivingList', breadcrumb: 'SocialMediaArchivingList', roles: config.authRoles.sa }
        },
        {
          path: 'SocialMediaArchivingForm',
          component: SocialMediaArchivingFormComponent,
          data: { title: 'SocialMediaArchivingForm', breadcrumb: 'SocialMediaArchivingForm', roles: config.authRoles.sa }
        },
        {
          path: 'ProjectLogList',
          component: ProjectlogComponent,
          data: { title: 'ProjectLogList', breadcrumb: 'ProjectLogList', roles: config.authRoles.sa }
        },                   
        {
          path: 'Mediacoveragelist',
          component: MediacoveragelistComponent,
          data: { title: 'Mediacoveragelist', breadcrumb: 'Mediacoveragelist', roles: config.authRoles.sa }
        },
        {
          path: 'Mediacoverageform',
          component: MediacoverageformComponent,
          data: { title: 'Mediacoverageform', breadcrumb: 'Mediacoverageform', roles: config.authRoles.sa }
        },
        {
          path: 'Calendarform',
          component: CalendarformComponent,
          data: { title: 'Calendarform', breadcrumb: 'Calendarform', roles: config.authRoles.sa }
        },

        
      ]
    }
];
