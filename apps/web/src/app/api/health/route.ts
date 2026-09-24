export function GET() {
  return Response.json(
    {
      service: "voxora-web",
      status: "ok",
      version: "0.1.0",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
