import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#121217",
          borderRadius: "44px",
          position: "relative",
        }}
      >
        {/* Outer Ring */}
        <div
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            border: "8px solid #FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Inner Glowing Core */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7C3AED 0%, #E11D48 60%, #FB923C 100%)",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
