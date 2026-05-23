import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type FirebaseStorage,
} from "firebase/storage";

const extractStoragePathFromUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("firebasestorage.googleapis.com")) {
      return null;
    }
    const match = parsed.pathname.match(/\/o\/(.+)/);
    if (!match?.[1]) {
      return null;
    }
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const validateProductImage = (file: File): string | null => {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Upload a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
};

export const uploadProductImage = async (
  storage: FirebaseStorage,
  productId: string,
  file: File,
): Promise<string> => {
  const validationError = validateProductImage(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `products/${productId}/${Date.now()}.${extension}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(storageRef);
};

export const deleteProductImage = async (
  storage: FirebaseStorage,
  imageUrl: string,
): Promise<void> => {
  if (!imageUrl.startsWith("https://")) {
    return;
  }

  try {
    const path = extractStoragePathFromUrl(imageUrl);
    if (!path) {
      return;
    }
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch {
    // Ignore missing or external URLs.
  }
};
