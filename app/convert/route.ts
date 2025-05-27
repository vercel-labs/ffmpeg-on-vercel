import ffmpeg from "ffmpeg-static";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

interface QualitySettings {
  [key: string]: string[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const inputFile = "sample.mp4";
  const format = searchParams.get("format") || "webm";
  const quality = searchParams.get("quality") || "low";

  if (!inputFile) {
    return NextResponse.json(
      { error: "Input file parameter required" },
      { status: 400 }
    );
  }

  try {
    // Define paths - assuming file is in public/videos/
    const inputPath = path.join(process.cwd(), "public", "videos", inputFile);

    // Check if input file exists
    try {
      await fs.access(inputPath);
    } catch {
      return NextResponse.json(
        { error: "Input file not found" },
        { status: 404 }
      );
    }

    // Set quality presets
    const qualitySettings: QualitySettings = {
      low: ["-crf", "28", "-preset", "fast"],
      medium: ["-crf", "23", "-preset", "medium"],
      high: ["-crf", "18", "-preset", "slow"],
    };

    const videoCodec = format === "webm" ? "libvpx-vp9" : "libx264";
    const audioCodec = format === "webm" ? "libopus" : "aac";
    const fastStart = format === "webm" ? [] : ["-movflags", "+faststart"];

    // FFmpeg arguments for conversion
    const ffmpegArgs = [
      "-i",
      inputPath,
      "-c:v",
      videoCodec,
      "-c:a",
      audioCodec,
      ...qualitySettings[quality],
      ...fastStart,
      "-f",
      format,
      "pipe:1", // pipe to stdout
    ];

    // Run FFmpeg conversion
    const convertedBuffer = await new Promise<Buffer>((resolve, reject) => {
      if (!ffmpeg) {
        reject(new Error("FFmpeg binary not found"));
        return;
      }

      const process = spawn("./node_modules/ffmpeg-static/ffmpeg", ffmpegArgs, { stdio: 'pipe'});

      let buffers: Buffer[] = [];
      let stderr = "";
      process.stdout.on("data", (data: Buffer) => {
        buffers.push(data);
      });
      process.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      process.on("close", (code: number | null) => {
        if (code === 0) {
          resolve(Buffer.concat(buffers));
        } else {
          reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`));
        }
      });

      process.on("error", (error: Error) => {
        reject(error);
      });
    });

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set("Content-Type", `video/${format}`);
    headers.set("Content-Length", convertedBuffer.byteLength.toString());

    return new NextResponse(convertedBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Video conversion error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Video conversion failed",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
