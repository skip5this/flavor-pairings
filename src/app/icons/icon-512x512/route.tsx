import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #b5dce0 0%, #c9c0e8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "280px",
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          FP
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
