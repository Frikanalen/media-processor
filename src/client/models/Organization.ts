/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { User } from './User';

export type Organization = {
    id?: number;
    name?: string;
    description?: string;
    homepage?: string;
    postalAddress?: string;
    streetAddress?: string;
    editor?: User;
};

