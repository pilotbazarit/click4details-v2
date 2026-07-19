import { NextResponse } from "next/server";

const ALLOWED_IMAGE_HOSTS = new Set([
  "amzn-s3-pilotbazar.s3.ap-southeast-1.amazonaws.com",
  "res.cloudinary.com",
]);

const IMAGE_EXTENSION_PATTERN = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(?:[?#].*)?$/i;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceUrl = searchParams.get("url");

    if (!sourceUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(sourceUrl);
    } catch {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_HOSTS.has(parsedUrl.hostname)) {
      return NextResponse.json({ error: "Image host is not allowed" }, { status: 400 });
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        Accept: "image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Image request failed" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const looksLikeImage = contentType.toLowerCase().startsWith("image/") || IMAGE_EXTENSION_PATTERN.test(parsedUrl.pathname);

    if (!looksLikeImage) {
      return NextResponse.json({ error: "URL does not point to an image" }, { status: 415 });
    }

    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Failed to proxy image" }, { status: 500 });
  }
}
