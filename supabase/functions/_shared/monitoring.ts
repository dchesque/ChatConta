import { logSecurityEvent, SecurityEventData } from './security.ts';

export interface PerformanceMetrics {
  functionName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  userId?: string;
  ipAddress?: string;
}

export class FunctionMonitor {
  private metrics: PerformanceMetrics;
  
  constructor(functionName: string, req: Request, userId?: string) {
    this.metrics = {
      functionName,
      startTime: Date.now(),
      success: false,
      userId,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
    };
  }
  
  success(data?: any): void {
    this.metrics.endTime = Date.now();
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
    this.metrics.success = true;
    
    this.log('info', 'Function completed successfully', data);
  }
  
  error(error: Error | string, data?: any): void {
    this.metrics.endTime = Date.now();
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
    this.metrics.success = false;
    this.metrics.error = error instanceof Error ? error.message : error;
    
    this.log('error', 'Function failed', { error: this.metrics.error, ...data });
    
    // Log security event for errors
    logSecurityEvent({
      event_type: 'function_error',
      user_id: this.metrics.userId,
      ip_address: this.metrics.ipAddress,
      metadata: {
        functionName: this.metrics.functionName,
        error: this.metrics.error,
        duration: this.metrics.duration
      }
    });
  }
  
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
  
  private log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logData = {
      level,
      timestamp: new Date().toISOString(),
      function: this.metrics.functionName,
      duration: this.metrics.duration,
      userId: this.metrics.userId,
      ipAddress: this.metrics.ipAddress,
      message,
      data
    };
    
    console.log(JSON.stringify(logData));
  }
  
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// Performance monitoring wrapper
export function withMonitoring<T>(
  functionName: string,
  handler: (monitor: FunctionMonitor) => Promise<T>
) {
  return async (req: Request): Promise<Response> => {
    const monitor = new FunctionMonitor(functionName, req);
    
    try {
      const result = await handler(monitor);
      monitor.success();
      
      if (result instanceof Response) {
        return result;
      }
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      monitor.error(error instanceof Error ? error : new Error(String(error)));
      
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: 'Ocorreu um erro interno. Tente novamente.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

// Alert thresholds
export const ALERT_THRESHOLDS = {
  SLOW_FUNCTION: 5000, // 5 seconds
  HIGH_ERROR_RATE: 0.1, // 10%
  HIGH_MEMORY_USAGE: 0.8, // 80%
} as const;

// Check if alerts should be triggered
export function checkAlerts(metrics: PerformanceMetrics[]): string[] {
  const alerts: string[] = [];
  
  // Check for slow functions
  const slowFunctions = metrics.filter(m => 
    m.duration && m.duration > ALERT_THRESHOLDS.SLOW_FUNCTION
  );
  
  if (slowFunctions.length > 0) {
    alerts.push(`${slowFunctions.length} função(ões) lentas detectadas`);
  }
  
  // Check error rate
  const totalRequests = metrics.length;
  const errorRequests = metrics.filter(m => !m.success).length;
  const errorRate = totalRequests > 0 ? errorRequests / totalRequests : 0;
  
  if (errorRate > ALERT_THRESHOLDS.HIGH_ERROR_RATE) {
    alerts.push(`Taxa de erro alta: ${(errorRate * 100).toFixed(1)}%`);
  }
  
  return alerts;
}