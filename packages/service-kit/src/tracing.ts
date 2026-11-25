import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import type { Logger } from 'pino';

export interface TracingHandle {
  readonly enabled: boolean;
  stop: () => Promise<void>;
}

const disabled: TracingHandle = {
  enabled: false,
  stop: async () => {
    /* tracing was not configured */
  },
};

/**
 * Opt-in OTLP tracing (spec §17). When no endpoint is configured the service
 * runs normally without exporting anything.
 */
export function startTracing(options: {
  service: string;
  endpoint?: string | undefined;
  logger: Logger;
}): TracingHandle {
  if (!options.endpoint) return disabled;

  const sdk = new NodeSDK({
    serviceName: options.service,
    traceExporter: new OTLPTraceExporter({ url: options.endpoint }),
  });
  sdk.start();
  options.logger.info({ endpoint: options.endpoint }, 'OpenTelemetry tracing enabled');

  return {
    enabled: true,
    stop: async () => {
      await sdk.shutdown();
    },
  };
}
