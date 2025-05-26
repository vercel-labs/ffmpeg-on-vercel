# FFmpeg on Vercel

[FFmpeg](https://ffmpeg.org/) runs natively on Vercel's Fluid compute without modifications.

See [route.ts](https://github.com/vercel-labs/ffmpeg-demo/blob/main/app/convert/route.ts) for sample usage based on [`ffmpeg-static` package](https://www.npmjs.com/package/ffmpeg-static) from npm.

Note, that you need to [declare the binary to be included in your function](https://github.com/vercel-labs/ffmpeg-demo/blob/main/next.config.ts#L7).

## Recommendation

Since FFmpeg takes full advantaged of available cores, we recommend increasing CPU/RAM with a configuration like this. Because Vercel's cost increases linearly with CPU availability, this increases performance, yet can be essentially cost-neutral for a CPU-bound workload like FFmpeg.

`[vercel.json]`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "app/convert/route.ts": {
      "memory": 3009
    }
  }
}
```
