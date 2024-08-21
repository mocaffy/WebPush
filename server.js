import { serveDir } from "https://deno.land/std@0.223.0/http/file_server.ts";
import WebPush from "./WebPush.js";
import { UUID } from "https://code4sabae.github.io/js/UUID.js";

Deno.serve(async (request) => {
  const pathname = new URL(request.url).pathname;

  if (request.method === "POST" && pathname === "/api/subscribe") {
    const param = await request.json()
    const subscription = param;
    const uuid = UUID.generate();
    await Deno.writeTextFile(
      "data/subscription/" + uuid + ".json",
      JSON.stringify(subscription),
    );
    console.log("subscribe", uuid);
    return new Response(
      JSON.stringify({
        uuid,
      }),
    );
  }
  if (request.method === "POST" && pathname === "/api/unsubscribe") {
    const param = await request.json()
    const uuid = param.uuid;
    await Deno.remove("data/subscription/" + uuid + ".json");
    console.log("unsubscribe", uuid);
    return new Response(
      JSON.stringify({
        uuid,
      }),
    );
  }
  if (request.method === "POST" && pathname === "/api/push") {
    try {
      const param = await request.json()
      const uuid = param.uuid;
      const data = param.data;
      console.log("push", uuid, data);
      const res = await WebPush.push(uuid, data);
      return new Response(
        JSON.stringify({
          res,
        }),
      );
    } catch (e) {
      console.log(e);
    }
  }

  return serveDir(request, {
    fsRoot: "./static/",
    urlRoot: "",
    enableCors: true,
  });
});
