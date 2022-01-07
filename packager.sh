set -x
nvffmpeg/ffmpeg/ffmpeg \
    -hwaccel nvdec -hwaccel_device 0 -hwaccel_output_format cuda \
    -i ${1} \
    -vf "hwupload,scale_npp=-2:360" \
    -c:v h264_nvenc -profile:v baseline -level:v 3.0 \
    -minrate 600k -maxrate 600k -bufsize 600k -b:v 600k \
    -y h264_baseline_360p_600.mp4 \
    -vf "hwupload,scale_npp=w=1024:h=576" \
    -c:v h264_nvenc -profile:v main -level:v 3.1 \
    -minrate 1000k -maxrate 1000k -bufsize 1000k -b:v 1000k \
    -y h264_main_576p_1000.mp4 \
    -vf "hwupload,scale_npp=w=1280:h=720" \
    -c:v h264_nvenc -profile:v main -level:v 4.0 \
    -minrate 3000k -maxrate 3000k -bufsize 3000k -b:v 3000k \
    -y h264_main_720p_3000.mp4 \
    -vf "hwupload,scale_npp=w=1920:h=1080" \
    -c:v h264_nvenc -profile:v high -level:v 4.2 \
    -minrate 6000k -maxrate 6000k -bufsize 6000k -b:v 6000k \
    -y h264_high_1080p_6000.mp4


# superlow
#
#    -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
# low
#    -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
#med
#    -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
# high
#    -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
