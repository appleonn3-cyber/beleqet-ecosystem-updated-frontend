import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq'; // Verified: Using bullmq wrapper
import { PerformanceWorkerController } from './performance-worker.controller';
import { PerformanceWorkerService } from './performance-worker.service';
import { HeavyTaskProcessor } from './processors/heavy-task.processor';

@Module({
  imports: [
    // ── CRITICAL CHECK: No forRoot or forRootAsync here anymore ──
    BullModule.registerQueue({
      name: 'performance-heavy-tasks',
      defaultJobOptions: {
        attempts: 3, 
        backoff: {
          type: 'exponential',
          delay: 2000, 
        },
        removeOnComplete: { age: 3600 }, 
        removeOnFail: { age: 86400 }, 
      },
    }),
  ],
  controllers: [PerformanceWorkerController],
  providers: [PerformanceWorkerService, HeavyTaskProcessor],
  exports: [PerformanceWorkerService],
})
export class PerformanceWorkerModule {}