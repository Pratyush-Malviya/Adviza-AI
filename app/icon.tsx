import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "8px",
          position: "relative",
        }}
      >
        {/* Outer Ring */}
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: "2px solid #FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Inner Glowing Core */}
          <div
            style={{
              width: "6px",
              height: "6px",
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
