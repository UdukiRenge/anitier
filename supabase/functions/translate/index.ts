import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { id } = await request.json();

    // DBからアニメ取得
    const { data: anime } = await supabase
      .from("anilist")
      .select("*")
      .eq("anime_id", id)
      .single();

    console.log("fetched anime:", anime);

    if (!anime) {
      throw new Error("Anime not found");
    }

    // 日本語訳が既にある場合はそれを返す
    if (anime.description_ja) {
      return new Response(
        JSON.stringify({
          ...anime,
          description: anime.description_ja
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 日本語訳が存在しない場合はGoogle翻訳APIで翻訳
    const url =
      "https://translate.googleapis.com/translate_a/single" +
      "?client=gtx" +
      "&sl=auto" +
      "&tl=ja" +
      "&dt=t" +
      `&q=${encodeURIComponent(anime.description_en)}`;

    const response = await fetch(url);
    const result = await response.json();

    const translated = result[0].map((item: any) => item[0]).join("");

    // 翻訳結果をDBに保存
    await supabase
      .from("anilist")
      .update({ description_ja: translated })
      .eq("id", id);

    // ⑤ 最新データをクライアントに返す
    return new Response(
      JSON.stringify({
        ...anime,
        description_ja: translated
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});