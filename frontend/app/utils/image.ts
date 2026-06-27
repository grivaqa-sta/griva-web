/**
 * Optimizes Cloudinary URLs by automatically injecting 'f_auto,q_auto'
 * to leverage Cloudinary's automatic compression and modern format selection.
 */
export function optimizeCloudinaryUrl(url: string): string {
  if (
    typeof url === "string" &&
    url.includes("res.cloudinary.com") &&
    url.includes("/upload/") &&
    !url.includes("f_auto") &&
    !url.includes("q_auto")
  ) {
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  }
  return url;
}

/**
 * Recursively scans any object/array and optimizes all Cloudinary URLs found within.
 */
export function processCloudinaryUrls<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === "string") {
    return optimizeCloudinaryUrl(obj) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(processCloudinaryUrls) as unknown as T;
  }
  
  if (typeof obj === "object") {
    // Avoid processing instances of Date or other special built-in objects
    if (obj instanceof Date || obj instanceof RegExp) {
      return obj;
    }
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = processCloudinaryUrls(obj[key]);
      }
    }
    return newObj as T;
  }
  
  return obj;
}
