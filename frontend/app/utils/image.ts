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

/**
 * Compresses an image file client-side and returns a new File object in WebP format.
 * Uses the HTML5 Canvas API to resize and compress the image.
 */
export async function compressImage(
  file: File,
  options = { maxWidth: 1200, maxHeight: 1200, quality: 0.75 }
): Promise<File> {
  // SSR safety check: if we are not in browser, return original file
  if (typeof window === "undefined") {
    return file;
  }

  // Only compress image files
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Skip animated GIFs to preserve animation
  if (file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > options.maxWidth) {
            height = Math.round((height * options.maxWidth) / width);
            width = options.maxWidth;
          }
        } else {
          if (height > options.maxHeight) {
            width = Math.round((width * options.maxHeight) / height);
            height = options.maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // fallback
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format with quality setting
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Generate compressed file name (replace extension with .webp)
            const lastDotIndex = file.name.lastIndexOf(".");
            const baseName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
            const newFileName = `${baseName}.webp`;

            const compressedFile = new File([blob], newFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            // If compressed file is larger or equal to original, return the original
            if (compressedFile.size >= file.size) {
              resolve(file);
            } else {
              resolve(compressedFile);
            }
          },
          "image/webp",
          options.quality
        );
      };
      img.onerror = () => {
        resolve(file);
      };
    };
    reader.onerror = () => {
      resolve(file);
    };
  });
}

