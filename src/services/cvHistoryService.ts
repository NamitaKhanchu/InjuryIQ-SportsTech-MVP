import type { CvAnalysisResult, CvStrainLevel } from './cvAnalysisService';

type CvHistoryVideo = {
  id: string;
  blob: Blob;
  filename: string;
  contentType: string;
};

export type CvHistoryEntry = {
  id: string;
  athleteId: string;
  createdAt: number;
  filename: string;
  title: string;
  summary: string;
  strain: CvStrainLevel;
  videoId: string;
  result: CvAnalysisResult;
};

const DB_NAME = 'injuryiq';
const DB_VERSION = 1;
const STORE_ANALYSES = 'cvAnalyses';
const STORE_VIDEOS = 'cvVideos';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_ANALYSES)) {
        const s = db.createObjectStore(STORE_ANALYSES, { keyPath: 'id' });
        s.createIndex('athleteId', 'athleteId', { unique: false });
        s.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
        db.createObjectStore(STORE_VIDEOS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function worstStrain(result: CvAnalysisResult): CvStrainLevel {
  const strains = (result.detectedMuscles || []).map((m) => m.strain);
  if (strains.includes('high')) return 'high';
  if (strains.includes('medium')) return 'medium';
  return 'low';
}

export async function saveCvHistoryEntry(params: {
  athleteId: string;
  file: File;
  result: CvAnalysisResult;
  title: string;
}): Promise<CvHistoryEntry> {
  const db = await openDb();
  const id = crypto.randomUUID();
  const videoId = crypto.randomUUID();

  const entry: CvHistoryEntry = {
    id,
    athleteId: params.athleteId,
    createdAt: Date.now(),
    filename: params.file.name,
    title: params.title,
    summary: (params.result.summary || 'CV analysis complete').slice(0, 140),
    strain: worstStrain(params.result),
    videoId,
    result: params.result,
  };

  const video: CvHistoryVideo = {
    id: videoId,
    blob: params.file,
    filename: params.file.name,
    contentType: params.file.type || 'video/mp4',
  };

  const tx = db.transaction([STORE_ANALYSES, STORE_VIDEOS], 'readwrite');
  tx.objectStore(STORE_VIDEOS).put(video);
  tx.objectStore(STORE_ANALYSES).put(entry);
  await txDone(tx);
  return entry;
}

export async function listCvHistoryForAthlete(athleteId: string): Promise<CvHistoryEntry[]> {
  const db = await openDb();
  const tx = db.transaction([STORE_ANALYSES], 'readonly');
  const store = tx.objectStore(STORE_ANALYSES);
  const idx = store.index('athleteId');

  const entries: CvHistoryEntry[] = [];
  await new Promise<void>((resolve, reject) => {
    const cursorReq = idx.openCursor(IDBKeyRange.only(athleteId));
    cursorReq.onerror = () => reject(cursorReq.error);
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) {
        resolve();
        return;
      }
      entries.push(cursor.value as CvHistoryEntry);
      cursor.continue();
    };
  });
  await txDone(tx);
  entries.sort((a, b) => b.createdAt - a.createdAt);
  return entries;
}

export async function loadCvHistoryEntry(entryId: string): Promise<{ entry: CvHistoryEntry; videoBlob: Blob }> {
  const db = await openDb();
  const tx = db.transaction([STORE_ANALYSES, STORE_VIDEOS], 'readonly');
  const entry = (await reqToPromise(tx.objectStore(STORE_ANALYSES).get(entryId))) as CvHistoryEntry | undefined;
  if (!entry) throw new Error('History entry not found');
  const vid = (await reqToPromise(tx.objectStore(STORE_VIDEOS).get(entry.videoId))) as CvHistoryVideo | undefined;
  if (!vid?.blob) throw new Error('Video blob not found');
  await txDone(tx);
  return { entry, videoBlob: vid.blob };
}

export async function deleteCvHistoryEntry(entryId: string): Promise<void> {
  const db = await openDb();
  // Need to read the entry first to know which video blob to delete.
  const tx = db.transaction([STORE_ANALYSES, STORE_VIDEOS], 'readwrite');
  const storeA = tx.objectStore(STORE_ANALYSES);
  const storeV = tx.objectStore(STORE_VIDEOS);

  const entry = (await reqToPromise(storeA.get(entryId))) as CvHistoryEntry | undefined;
  if (entry?.videoId) {
    storeV.delete(entry.videoId);
  }
  storeA.delete(entryId);
  await txDone(tx);
}

