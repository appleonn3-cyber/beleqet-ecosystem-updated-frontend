import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Defines the structure for anomaly alert payloads.
 * Used across all alerting channels (Email, Slack, etc.)
 */
export interface AlertPayload {
  /** Short descriptive title of the anomaly */
  title: string;
  /** Detailed message explaining the anomaly */
  message: string;
  /** Severity level of the anomaly */
  severity: 'HIGH' | 'CRITICAL' | 'WARNING';
  /** ISO 8601 timestamp when the anomaly was detected */
  timestamp: string;
}

/**
 * AlertingService - Dispatches anomaly alerts to configured channels.
 * Currently supports Email and Slack notifications.
 * Designed to be extensible for future channels (e.g., PagerDuty, Telegram).
 */
@Injectable()
export class AlertingService {
  private readonly logger = new Logger(AlertingService.name);

  constructor(
    private readonly config: ConfigService,
  ) {}
}
