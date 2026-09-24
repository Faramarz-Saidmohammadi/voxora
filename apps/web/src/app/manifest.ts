import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Voxora",
    short_name: "Voxora",
    description: "Governed, provider-independent voice infrastructure.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#07120f",
  };
}
