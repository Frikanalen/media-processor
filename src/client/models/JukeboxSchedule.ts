/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type JukeboxSchedule = {
    from: string;
    to: string;
    entries: Array<{
        video: number;
        startsAt: string;
    }>;
};

