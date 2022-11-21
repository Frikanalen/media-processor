/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type VideoMediaForm = {
    /**
     * Original file name as uploaded on client
     */
    fileName: string;
    /**
     * Location of file (see locator format)
     */
    locator: string;
    /**
     * Duration in seconds
     */
    duration: number;
    /**
     * File metadata as returned by ffprobe
     */
    metadata: any;
};

