const Sentry = require("@Sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: "https://c62bafff66f00a4a4c9dc3d02e3750ee@o4508686691008512.ingest.de.sentry.io/4508686717288528",
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profileSampleRate: 1.0,
});

Sentry.profiler.startProfiler();

Sentry.startSpan(
  {
    name: "My First Transaction",
  },
  () => {}
);

Sentry.profiler.stopProfiler();
