import { json } from "@sveltejs/kit";
import { v as vocabularyData } from "../../../../../chunks/vocabulary.js";
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
function getAvailableFilters(items) {
  const levels = new Set(items.map((item) => item.level));
  const categories = new Set(items.map((item) => item.category));
  return {
    levels: Array.from(levels).sort(),
    categories: Array.from(categories).sort()
  };
}
const GET = async ({ url }) => {
  try {
    const level = url.searchParams.get("level") || void 0;
    const category = url.searchParams.get("category") || void 0;
    const search = url.searchParams.get("search") || void 0;
    const direction = url.searchParams.get("direction") || void 0;
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset") || "0";
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    let filteredItems = filterVocabularyItems(validatedItems, level, category, search, direction);
    const offsetNum = parseInt(offset, 10);
    const limitNum = limit ? parseInt(limit, 10) : void 0;
    if (limitNum) {
      filteredItems = filteredItems.slice(offsetNum, offsetNum + limitNum);
    } else if (offsetNum > 0) {
      filteredItems = filteredItems.slice(offsetNum);
    }
    const hasMore = limitNum ? offsetNum + limitNum < validatedItems.length : false;
    const response = createAPIResponse(filteredItems, hasMore);
    return json(response);
  } catch (error) {
    console.error("[VocabularyAPI] Error loading filtered vocabulary:", error);
    return json(
      {
        error: "Failed to load filtered vocabulary",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { level, category, search, direction, limit, offset = 0 } = body;
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    let filteredItems = filterVocabularyItems(validatedItems, level, category, search, direction);
    const offsetNum = parseInt(offset, 10);
    const limitNum = limit ? parseInt(limit, 10) : void 0;
    if (limitNum) {
      filteredItems = filteredItems.slice(offsetNum, offsetNum + limitNum);
    } else if (offsetNum > 0) {
      filteredItems = filteredItems.slice(offsetNum);
    }
    const hasMore = limitNum ? offsetNum + limitNum < validatedItems.length : false;
    const response = createAPIResponse(filteredItems, hasMore);
    const availableFilters = getAvailableFilters(validatedItems);
    return json({
      ...response,
      filters: availableFilters
    });
  } catch (error) {
    console.error("[VocabularyAPI] Error loading filtered vocabulary:", error);
    return json(
      {
        error: "Failed to load filtered vocabulary",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};
export {
  GET,
  POST
};
