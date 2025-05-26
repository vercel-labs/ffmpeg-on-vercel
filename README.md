FFMPEG runs natively on Vercel's Fluid compute

See [route.ts](https://github.com/vercel-labs/ffmpeg-demo/blob/main/app/convert/route.ts) for sample usage based on [`ffmpeg-static` package](https://www.npmjs.com/package/ffmpeg-static) from npm.

Note, that you need to [declare the binary to be included in your function](https://github.com/vercel-labs/ffmpeg-demo/blob/main/next.config.ts#L7).
