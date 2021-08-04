const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

export type testVideo = {
  seconds: number;
  width: number;
  height: number;
  framerate: number;
  text: string;
  format: string;
  filename: string;
};

// Create an ffmpeg filter line.
// Returns a string suitable for passing directly into a complex filter graph.
const ffmpegTextFilter = (v: testVideo): string => {
  const fontFile =
    "node_modules/@fontsource/open-sans/files/open-sans-latin-ext-600-normal.woff";

  if (!fs.existsSync(fontFile)) {
    throw new Error("Font file not found!");
  }

  const spacingPixels = v.height / 30;
  const text = `text='${v.text}\n%{pts\\\:hms}'`;
  const location = `x=(w-text_w)/2:y=(h*0.75)`;
  const style = `box=1:boxcolor=0x00000000@1:boxborderw=${spacingPixels}:line_spacing=${spacingPixels}`;
  const font = `fontcolor=white:fontsize=(h/20):fontfile=${fontFile}`;
  return `drawtext=${text}:${location}:${style}:${font}`;
};

export const ffmpegCommand = (
  v: testVideo,
  progressCallback: (percent: number) => void
): Promise<void> => {
  const emitProgress = (p: any) =>
    progressCallback((p.frames / v.framerate / v.seconds) * 100);
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(`testsrc=size=${v.width}x${v.height}:rate=${v.framerate}`)
      .inputFormat("lavfi")
      .duration(v.seconds)
      .complexFilter([ffmpegTextFilter(v)])
      .output(v.filename)
      .outputFormat(v.format)
      .on("end", resolve)
      .on("progress", emitProgress)
      .on("error", reject)
      .run();
  });
};
