import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Otti Bull",
    short_name: "Otti Bull",
    description: "Alquiler de Autocaravanas Premium en Barcelona",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#1b3527",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
