import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_PROFILE_PICTURE_URL,
  PROFILE_PICTURE_PUBLIC_PREFIX,
} from "@/lib/profile-picture-constants";

const PROFILE_PICTURE_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "profile-picture",
);

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function getProfilePicturePublicUrl(userId: string) {
  const filename = await resolveProfilePictureFilename(userId);
  if (!filename) {
    return DEFAULT_PROFILE_PICTURE_URL;
  }

  try {
    const filePath = path.join(PROFILE_PICTURE_DIRECTORY, filename);
    const metadata = await stat(filePath);
    return `${PROFILE_PICTURE_PUBLIC_PREFIX}/${filename}?v=${metadata.mtimeMs}`;
  } catch {
    return `${PROFILE_PICTURE_PUBLIC_PREFIX}/${filename}`;
  }
}

export async function saveProfilePicture(userId: string, file: File) {
  const extension = resolveProfilePictureExtension(file);
  if (!extension) {
    throw new Error("Unsupported profile image format.");
  }

  await ensureProfilePictureDirectory();
  await removeExistingProfilePictures(userId);

  const filename = `${userId}${extension}`;
  const filePath = path.join(PROFILE_PICTURE_DIRECTORY, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return getProfilePicturePublicUrl(userId);
}

export async function removeProfilePicture(userId: string) {
  await ensureProfilePictureDirectory();
  await removeExistingProfilePictures(userId);
  return DEFAULT_PROFILE_PICTURE_URL;
}

async function resolveProfilePictureFilename(userId: string) {
  if (!userId.trim()) {
    return null;
  }

  try {
    await ensureProfilePictureDirectory();
    const files = await readdir(PROFILE_PICTURE_DIRECTORY);
    const normalizedPrefix = `${userId}.`;

    return (
      files.find((filename) => filename.startsWith(normalizedPrefix)) ?? null
    );
  } catch {
    return null;
  }
}

async function removeExistingProfilePictures(userId: string) {
  const files = await readdir(PROFILE_PICTURE_DIRECTORY);
  const matchingFiles = files.filter((filename) =>
    filename.startsWith(`${userId}.`),
  );

  await Promise.all(
    matchingFiles.map((filename) =>
      unlink(path.join(PROFILE_PICTURE_DIRECTORY, filename)),
    ),
  );
}

async function ensureProfilePictureDirectory() {
  await mkdir(PROFILE_PICTURE_DIRECTORY, { recursive: true });
}

function resolveProfilePictureExtension(file: File) {
  const mimeExtension = MIME_EXTENSION_MAP[file.type];
  if (mimeExtension) {
    return mimeExtension;
  }

  const originalExtension = path.extname(file.name).toLowerCase();
  return Object.values(MIME_EXTENSION_MAP).includes(originalExtension)
    ? originalExtension
    : null;
}
