/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type NewOrganizationForm = {
    /**
     * The organization number from the Brønnøysund Register Centre. Must be exactly 9 digits.
     */
    brregNumber?: number;
    name: string;
    postalAddress: string;
    streetAddress: string;
    homepage?: string;
};

