import "dotenv/config";
import { HttpServer } from "@effect/platform";
import {
  NodeHttpClient,
  NodeHttpServer,
  NodeRuntime,
} from "@effect/platform-node";
import { Layer } from "effect";
import type { Effect } from "effect/Effect";
import { createServer } from "node:http";
import { createRouter } from "./routes/index.js";

const router = createRouter();

const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress);

const port = Number(process.env.PORT ?? 3001);

const serverLayer = NodeHttpServer.layer(() => createServer(), { port });
const runtimeLayer = Layer.mergeAll(serverLayer, NodeHttpClient.layer);

const program = Layer.launch(
  Layer.provide(app, runtimeLayer)
) as Effect<never, unknown, never>;

NodeRuntime.runMain(program);
