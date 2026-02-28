export class ObservabilityLogger {
  public logAPICall(apiName: string, duration: number, status: number): void {
    console.log(`[API Call] ${apiName} - ${duration}ms - Status: ${status}`);
  }

  public logCacheOperation(operation: string, key: string, timestamp: number): void {
    console.log(`[Cache ${operation}] ${key} at ${timestamp}`);
  }

  public logScoringComputation(country: string, params: any): void {
    console.log(`[Scoring] Computing for ${country} with preferences: ${JSON.stringify(params)}`);
  }

  public logFailure(apiName: string, error: string, country?: string): void {
    console.error(`[Failure] ${apiName} failed for ${country || 'system'}: ${error}`);
  }

  public logCompletion(processingTime: number, countryCount: number): void {
    console.log(`[Analysis Complete] Ranked ${countryCount} countries in ${processingTime}ms`);
  }
}
