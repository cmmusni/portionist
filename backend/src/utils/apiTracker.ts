/**
 * API Usage Tracker
 * Tracks and logs API calls to monitor rate limits
 */

interface APICall {
  timestamp: Date;
  endpoint: string;
  status: number;
  api: "spoonacular" | "google" | "gemini";
}

class APITracker {
  private calls: APICall[] = [];
  private readonly RESET_HOURS = 24; // Reset counter every 24 hours

  /**
   * Log an API call
   */
  logCall(
    api: "spoonacular" | "google" | "gemini",
    endpoint: string,
    status: number,
  ) {
    const call: APICall = {
      timestamp: new Date(),
      endpoint,
      status,
      api,
    };

    this.calls.push(call);
    this.cleanOldCalls();

    // Log immediately
    console.log(
      `📡 API CALL: ${api.toUpperCase()} - ${endpoint} - Status: ${status}`,
    );

    // Log summary after each call
    this.logSummary();
  }

  /**
   * Remove calls older than RESET_HOURS
   */
  private cleanOldCalls() {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - this.RESET_HOURS);

    this.calls = this.calls.filter((call) => call.timestamp > cutoffTime);
  }

  /**
   * Get call count for specific API in last 24 hours
   */
  getCallCount(api: "spoonacular" | "google" | "gemini"): number {
    this.cleanOldCalls();
    return this.calls.filter((call) => call.api === api).length;
  }

  /**
   * Get all calls for specific API in last 24 hours
   */
  getCalls(api: "spoonacular" | "google" | "gemini"): APICall[] {
    this.cleanOldCalls();
    return this.calls.filter((call) => call.api === api);
  }

  /**
   * Check if API is near limit
   */
  isNearLimit(api: "spoonacular" | "google" | "gemini"): boolean {
    const limits = {
      spoonacular: 150,
      google: 100,
      gemini: 1500, // RPD (requests per day)
    };

    const count = this.getCallCount(api);
    const limit = limits[api];
    const threshold = limit * 0.8; // 80% threshold

    return count >= threshold;
  }

  /**
   * Log current usage summary
   */
  logSummary() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 API USAGE SUMMARY (Last 24 Hours)");
    console.log("=".repeat(60));

    const apis: Array<"spoonacular" | "google" | "gemini"> = [
      "spoonacular",
      "google",
      "gemini",
    ];
    const limits = {
      spoonacular: 150,
      google: 100,
      gemini: 1500,
    };

    for (const api of apis) {
      const count = this.getCallCount(api);
      const limit = limits[api];
      const percentage = Math.round((count / limit) * 100);
      const status =
        percentage >= 80
          ? "🔴 CRITICAL"
          : percentage >= 60
            ? "🟡 WARNING"
            : "🟢 OK";

      console.log(
        `${status} ${api.toUpperCase()}: ${count}/${limit} calls (${percentage}%)`,
      );

      // Show last 3 calls
      const recentCalls = this.getCalls(api).slice(-3);
      if (recentCalls.length > 0) {
        console.log(`   Recent calls:`);
        for (const call of recentCalls) {
          const timeStr = call.timestamp.toLocaleTimeString();
          console.log(`   - ${timeStr}: ${call.endpoint} (${call.status})`);
        }
      }
    }

    console.log("=".repeat(60) + "\n");
  }

  /**
   * Get detailed report
   */
  getDetailedReport(): string {
    this.cleanOldCalls();

    const apis: Array<"spoonacular" | "google" | "gemini"> = [
      "spoonacular",
      "google",
      "gemini",
    ];
    const limits = {
      spoonacular: 150,
      google: 100,
      gemini: 1500,
    };

    let report = "\n📊 DETAILED API USAGE REPORT\n";
    report += "=".repeat(60) + "\n\n";

    for (const api of apis) {
      const calls = this.getCalls(api);
      const count = calls.length;
      const limit = limits[api];
      const percentage = Math.round((count / limit) * 100);

      report += `${api.toUpperCase()}\n`;
      report += `-`.repeat(60) + "\n";
      report += `Total Calls: ${count}/${limit} (${percentage}%)\n`;
      report += `Status: ${percentage >= 80 ? "🔴 CRITICAL - Near Limit!" : percentage >= 60 ? "🟡 WARNING" : "🟢 OK"}\n`;

      if (count > 0) {
        // Group by endpoint
        const endpointCounts = new Map<string, number>();
        for (const call of calls) {
          endpointCounts.set(
            call.endpoint,
            (endpointCounts.get(call.endpoint) || 0) + 1,
          );
        }

        report += `\nBreakdown by endpoint:\n`;
        for (const [endpoint, endpointCount] of endpointCounts) {
          const endpointPercentage = Math.round((endpointCount / count) * 100);
          report += `  • ${endpoint}: ${endpointCount} calls (${endpointPercentage}%)\n`;
        }

        // Show error rate
        const errorCalls = calls.filter((c) => c.status >= 400);
        if (errorCalls.length > 0) {
          const errorRate = Math.round((errorCalls.length / count) * 100);
          report += `\n⚠️  Error Rate: ${errorCalls.length}/${count} (${errorRate}%)\n`;
        }
      }

      report += "\n";
    }

    report += "=".repeat(60) + "\n";

    return report;
  }

  /**
   * Reset all tracked calls (for testing)
   */
  reset() {
    this.calls = [];
    console.log("🔄 API tracker reset");
  }
}

// Export singleton instance
export const apiTracker = new APITracker();
