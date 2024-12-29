export async function retry<T>(
  operation: () => Promise<T>,
  attempts: number = 3
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
  throw new Error('All retry attempts failed');
}