export interface Env {
  GOOGLE_MAPS_API_KEY: string;
}

type ReviewOut = {
  authorName?: string;
  rating?: number;
  text?: string;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  profilePhotoUrl?: string;
};

type ResponseOut = {
  placeId: string;
  rating?: number;
  userRatingCount?: number;
  reviews: ReviewOut[];
  fetchedAt: string;
};

const PLACE_ID = "ChIJ1ciLHn-KQQ0RBpdzQGpBshE";
const MAX_REVIEWS = 5;

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.GOOGLE_MAPS_API_KEY) {
    return json(
      { error: "Missing GOOGLE_MAPS_API_KEY" },
      500,
      "public, s-maxage=60"
    );
  }

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
    PLACE_ID
  )}`;

  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "rating,userRatingCount,reviews",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return json(
      { error: "Places API error", status: res.status, body: text.slice(0, 500) },
      502,
      "public, s-maxage=300"
    );
  }

  const data = (await res.json()) as any;

  const reviewsRaw: any[] = Array.isArray(data.reviews) ? data.reviews : [];
  // Orden por publishTime desc si existe
  reviewsRaw.sort((a, b) => {
    const ta = Date.parse(a.publishTime ?? 0) || 0;
    const tb = Date.parse(b.publishTime ?? 0) || 0;
    return tb - ta;
  });

  const reviews: ReviewOut[] = reviewsRaw.slice(0, MAX_REVIEWS).map((r) => ({
    authorName: r.authorAttribution?.displayName,
    profilePhotoUrl: r.authorAttribution?.photoUri,
    rating: r.rating,
    text: r.text?.text, // Places New devuelve text:{text,languageCode}
    relativePublishTimeDescription: r.relativePublishTimeDescription,
    publishTime: r.publishTime,
  }));

  const out: ResponseOut = {
    placeId: PLACE_ID,
    rating: data.rating,
    userRatingCount: data.userRatingCount,
    reviews,
    fetchedAt: new Date().toISOString(),
  };

  return json(out, 200, "public, s-maxage=21600, stale-while-revalidate=86400");
};

function json(body: unknown, status = 200, cacheControl?: string) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
  });
  if (cacheControl) headers.set("Cache-Control", cacheControl);
  return new Response(JSON.stringify(body), { status, headers });
}
