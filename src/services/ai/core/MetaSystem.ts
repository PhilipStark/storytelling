import { AIConfig } from '../config/AIConfig';
import { SystemMetrics } from '../types';

export class MetaSystem {
  private performanceHistory: SystemMetrics[] = [];

  async optimize(): Promise<void> {
    const metrics = await this.analyzePerformance();
    await this.evolveSystem(metrics);
  }

  private async analyzePerformance(): Promise<SystemMetrics> {
    const recentHistory = this.performanceHistory.slice(-100);
    return {
      successRate: this.calculateSuccessRate(recentHistory),
      averageQuality: this.calculateAverageQuality(recentHistory),
      processingTime: this.calculateAverageTime(recentHistory)
    };
  }

  private async evolveSystem(metrics: SystemMetrics): Promise<void> {
    if (metrics.successRate < AIConfig.thresholds.success) {
      await this.improveReliability();
    }
    if (metrics.averageQuality < AIConfig.thresholds.quality) {
      await this.enhanceQuality();
    }
  }

  private calculateSuccessRate(history: SystemMetrics[]): number {
    return history.filter(m => m.success).length / history.length;
  }

  private calculateAverageQuality(history: SystemMetrics[]): number {
    return history.reduce((sum, m) => sum + m.quality, 0) / history.length;
  }

  private calculateAverageTime(history: SystemMetrics[]): number {
    return history.reduce((sum, m) => sum + m.processingTime, 0) / history.length;
  }
}