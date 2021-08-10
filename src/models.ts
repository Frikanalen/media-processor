import {PrismaClient} from "@prisma/client";
import {Logger} from "tslog";
const log: Logger = new Logger();
const prisma = new PrismaClient({
    rejectOnNotFound: true
});

export class IngestJob {
    public readonly id: number;

    constructor(jobID: number) {
        this.id = jobID
    }

    static async create(videoID: number, jobType: string): Promise<IngestJob> {
        const {id: jobID} = await prisma.fk_ingestjob.create({
            data: {job_type: jobType, video_id: videoID},
        });

        return new IngestJob(jobID)
    }

    async setState(state: string, statusMessage?: string) {
        await prisma.fk_ingestjob.update({
            where: {id: this.id},
            data: {state: state, status_text: statusMessage},
        });
    }

    async setProgress(percentageDone: number) {
        percentageDone = Math.ceil(percentageDone)
        await prisma.fk_ingestjob.update({
            where: {id: this.id},
            data: {
                percentage_done: percentageDone
            },
        });
    }
}

declare module mediaMetadata {

    export interface Tags {
        encoder: string;
        major_brand: string;
        minor_version: string;
        compatible_brands: string;
    }

    export interface Format {
        size: number;
        tags: Tags;
        bit_rate: number;
        duration: number;
        filename: string;
        nb_streams: number;
        start_time: number;
        format_name: string;
        nb_programs: number;
        probe_score: number;
        format_long_name: string;
    }

    export interface Tags2 {
        language: string;
        handler_name: string;
        creation_time?: Date;
    }

    export interface Disposition {
        dub: number;
        forced: number;
        lyrics: number;
        comment: number;
        default: number;
        karaoke: number;
        original: number;
        attached_pic: number;
        clean_effects: number;
        visual_impaired: number;
        hearing_impaired: number;
        timed_thumbnails: number;
    }

    export interface Stream {
        id: string;
        refs: number;
        tags: Tags2;
        index: number;
        level: number;
        width: number;
        height: number;
        is_avc: string;
        pix_fmt: string;
        profile: string;
        bit_rate: number;
        duration: number;
        timecode: string;
        codec_tag: string;
        nb_frames: number;
        start_pts: number;
        time_base: string;
        codec_name: string;
        codec_type: string;
        start_time: number;
        coded_width: number;
        color_range: string;
        color_space: string;
        disposition: Disposition;
        duration_ts: number;
        field_order: string;
        coded_height: number;
        has_b_frames: number;
        max_bit_rate: any;
        r_frame_rate: string;
        avg_frame_rate: string;
        color_transfer: string;
        nb_read_frames: string;
        chroma_location: string;
        closed_captions: number;
        codec_long_name: string;
        codec_time_base: string;
        color_primaries: string;
        nal_length_size: number;
        nb_read_packets: string;
        codec_tag_string: string;
        bits_per_raw_sample: any;
        sample_aspect_ratio: string;
        display_aspect_ratio: string;
        channels?: number;
        sample_fmt: string;
        sample_rate?: number;
        channel_layout: string;
        bits_per_sample?: number;
    }
}

export interface mediaMetadata {
    format: mediaMetadata.Format;
    streams: mediaMetadata.Stream[];
    chapters: any[];
}

export interface mediaMetadataRecord {
    version: 1
    data: mediaMetadata
}

export class Video {
    public readonly id: number;

    public get mediaMetadata(): Promise<mediaMetadata> {
        return (async () =>
        {
            const {media_metadata: mediaMetadata} = await prisma.fk_video.findUnique({where: {id: this.id}});
            if(typeof mediaMetadata !== 'object') throw new Error ("Invalid metadata!")
            if(!mediaMetadata) throw new Error ("No metadata stored!")
            const meta = mediaMetadata as unknown as mediaMetadataRecord
            return meta.data
        })()
    }

    constructor(videoID: number) {
        this.id = videoID
    }
}

export class Asset {
    public readonly id: number;

    public get location() {
        return (async () =>
        {
            const {location} = await prisma.fk_asset.findUnique({where: {id: this.id}});
            return location
        })()
    }

    static async create(videoID: number, assetType: string, location: string): Promise<Asset> {
        const { id } = await prisma.fk_asset.create({
            data: {asset_type: assetType, video_id: videoID, location},
        });

        log.debug(id)

        return new Asset(id)
    }

    constructor(assetID: number) {
        this.id = assetID
    }
}