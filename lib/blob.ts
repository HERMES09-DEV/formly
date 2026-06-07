import { del } from "@vercel/blob";

function isVercelBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export async function deleteStoredBlobs(values: string[]) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const urls = [...new Set(values.filter(isVercelBlobUrl))];

  if (!token || urls.length === 0) {
    return;
  }

  try {
    await del(urls, { token });
  } catch (blobError) {
    console.error("Blob cleanup failed:", blobError);
  }
}
