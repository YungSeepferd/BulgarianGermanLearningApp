import { json } from "@sveltejs/kit";
import { v as vocabularyData } from "../../../../../../chunks/vocabulary.js";
function validateVocabularyItem(item) {
  if (!item || typeof item !== "object") {
    throw new Error("Invalid vocabulary item: must be an object");
  }
  const required = ["id", "word", "translation", "source_lang", "target_lang", "category", "level"];
  for (const field of required) {
    if (!(field in item)) {
      throw new Error(`Invalid vocabulary item: missing required field '${field}'`);
    }
  }
  if (!["bg", "de"].includes(item.source_lang) || !["bg", "de"].includes(item.target_lang)) {
    throw new Error('Invalid vocabulary item: source_lang and target_lang must be "bg" or "de"');
  }
  if (!["A1", "A2", "B1", "B2", "C1"].includes(item.level)) {
    throw new Error("Invalid vocabulary item: level must be one of A1, A2, B1, B2, C1");
  }
  return item;
}
function createAPIResponse(items, hasMore = false) {
  return {
    data: items,
    total: items.length,
    loaded: items.length,
    hasMore,
    timestamp: Date.now()
  };
}
function getVocabularyChunk(chunkName, allItems) {
  const chunkSize = 50;
  const startIndex = getChunkStartIndex(chunkName, allItems.length);
  const endIndex = Math.min(startIndex + chunkSize, allItems.length);
  return allItems.slice(startIndex, endIndex);
}
function getChunkStartIndex(chunkName, totalItems) {
  if (/^\d+$/.test(chunkName)) {
    const chunkNumber = parseInt(chunkName, 10);
    return chunkNumber * 50;
  }
  if (/^[A-Z][0-9]$/.test(chunkName)) {
    return 0;
  }
  return 0;
}
const GET = async ({ params }) => {
  try {
    const { chunkName } = params;
    if (!chunkName) {
      return json(
        { error: "Chunk name is required" },
        { status: 400 }
      );
    }
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    const chunkItems = getVocabularyChunk(chunkName, validatedItems);
    const response = createAPIResponse(chunkItems);
    return json(response);
  } catch (error) {
    console.error("[VocabularyAPI] Error loading chunk:", error);
    return json(
      {
        error: "Failed to load vocabulary chunk",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};
const POST = async ({ params, request }) => {
  try {
    const { chunkName } = params;
    if (!chunkName) {
      return json(
        { error: "Chunk name is required" },
        { status: 400 }
      );
    }
    const body = await request.json().catch(() => ({}));
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    const { level, category, search, direction } = body;
    let chunkItems = getVocabularyChunk(chunkName, validatedItems);
    if (level || category || search || direction) {
      chunkItems = filterVocabularyItems(chunkItems, level, category, search, direction);
    }
    const response = createAPIResponse(chunkItems);
    return json(response);
  } catch (error) {
    console.error("[VocabularyAPI] Error loading chunk:", error);
    return json(
      {
        error: "Failed to load vocabulary chunk",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};
function filterVocabularyItems(items, level, category, search, direction) {
  let filtered = [...items];
  if (level && level !== "all") {
    filtered = filtered.filter((item) => item.level === level);
  }
  if (category && category !== "all") {
    filtered = filtered.filter((item) => item.category === category);
  }
  if (search && search.trim()) {
    const searchTerm = search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) => item.word.toLowerCase().includes(searchTerm) || item.translation.toLowerCase().includes(searchTerm) || item.notes && item.notes.toLowerCase().includes(searchTerm)
    );
  }
  if (direction) {
    filtered = filtered.filter(
      (item) => direction === "bg-de" && item.source_lang === "bg" || direction === "de-bg" && item.source_lang === "de"
    );
  }
  return filtered;
}
export {
  GET,
  POST
};
