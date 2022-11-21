/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export { ApiError } from './core/ApiError';
export { CancelablePromise, CancelError } from './core/CancelablePromise';
export { OpenAPI } from './core/OpenAPI';
export type { OpenAPIConfig } from './core/OpenAPI';

export type { Bulletin } from './models/Bulletin';
export type { Category } from './models/Category';
export type { Config } from './models/Config';
export type { JukeboxSchedule } from './models/JukeboxSchedule';
export type { LoginForm } from './models/LoginForm';
export type { NewBulletinForm } from './models/NewBulletinForm';
export type { NewOrganizationForm } from './models/NewOrganizationForm';
export type { NewPlaylistForm } from './models/NewPlaylistForm';
export type { NewVideoForm } from './models/NewVideoForm';
export type { Organization } from './models/Organization';
export type { Playlist } from './models/Playlist';
export type { RegisterForm } from './models/RegisterForm';
export type { ResourceList } from './models/ResourceList';
export type { ScheduleEntry } from './models/ScheduleEntry';
export type { UpdateUserForm } from './models/UpdateUserForm';
export type { User } from './models/User';
export type { Video } from './models/Video';
export type { VideoMediaAsset } from './models/VideoMediaAsset';
export type { VideoMediaAssetForm } from './models/VideoMediaAssetForm';
export type { VideoMediaForm } from './models/VideoMediaForm';

export { AppService } from './services/AppService';
export { AuthenticationService } from './services/AuthenticationService';
export { BulletinsService } from './services/BulletinsService';
export { MediaService } from './services/MediaService';
export { OrganizationService } from './services/OrganizationService';
export { PlaylistService } from './services/PlaylistService';
export { SchedulingService } from './services/SchedulingService';
export { VideoService } from './services/VideoService';
