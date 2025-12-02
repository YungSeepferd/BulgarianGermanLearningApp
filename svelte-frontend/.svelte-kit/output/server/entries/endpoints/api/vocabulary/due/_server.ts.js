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
function filterByDirection(items, direction) {
  return items.filter(
    (item) => direction === "bg-de" && item.source_lang === "bg" || direction === "de-bg" && item.source_lang === "de"
  );
}
function getDueCards(items, direction, limit) {
  const directionFiltered = filterByDirection(items, direction);
  const shuffled = [...directionFiltered].sort(() => Math.random() - 0.5);
  const prioritized = shuffled.sort((a, b) => {
    if (a.difficulty !== void 0 && b.difficulty !== void 0) {
      return a.difficulty - b.difficulty;
    }
    const levelOrder = { "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5 };
    return (levelOrder[a.level] || 999) - (levelOrder[b.level] || 999);
  });
  return prioritized.slice(0, limit);
}
function getSpacedRepetitionStats(items, direction) {
  const directionFiltered = filterByDirection(items, direction);
  const stats = {
    total: directionFiltered.length,
    byLevel: {},
    byCategory: {},
    difficultyDistribution: {
      easy: 0,
      medium: 0,
      hard: 0
    }
  };
  directionFiltered.forEach((item) => {
    stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1;
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    if (item.difficulty !== void 0) {
      if (item.difficulty <= 2) {
        stats.difficultyDistribution.easy++;
      } else if (item.difficulty <= 4) {
        stats.difficultyDistribution.medium++;
      } else {
        stats.difficultyDistribution.hard++;
      }
    }
  });
  return stats;
}
const GET = async ({ url }) => {
  try {
    const direction = url.searchParams.get("direction") || "bg-de";
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const includeStats = url.searchParams.get("includeStats") === "true";
    if (!["bg-de", "de-bg"].includes(direction)) {
      return json(
        { error: 'Invalid direction. Must be "bg-de" or "de-bg"' },
        { status: 400 }
      );
    }
    if (limit < 1 || limit > 100) {
      return json(
        { error: "Invalid limit. Must be between 1 and 100" },
        { status: 400 }
      );
    }
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    const dueCards = getDueCards(validatedItems, direction, limit);
    const response = createAPIResponse(dueCards, dueCards.length >= limit);
    if (includeStats) {
      const stats = getSpacedRepetitionStats(validatedItems, direction);
      return json({
        ...response,
        stats
      });
    }
    return json(response);
  } catch (error) {
    console.error("[VocabularyAPI] Error loading due cards:", error);
    return json(
      {
        error: "Failed to load due cards",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { direction = "bg-de", limit = 20, includeStats = false, levels, categories } = body;
    if (!["bg-de", "de-bg"].includes(direction)) {
      return json(
        { error: 'Invalid direction. Must be "bg-de" or "de-bg"' },
        { status: 400 }
      );
    }
    if (limit < 1 || limit > 100) {
      return json(
        { error: "Invalid limit. Must be between 1 and 100" },
        { status: 400 }
      );
    }
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    let filteredItems = filterByDirection(validatedItems, direction);
    if (levels && levels.length > 0) {
      filteredItems = filteredItems.filter((item) => levels.includes(item.level));
    }
    if (categories && categories.length > 0) {
      filteredItems = filteredItems.filter((item) => categories.includes(item.category));
    }
    const dueCards = getDueCards(filteredItems, direction, limit);
    const response = createAPIResponse(dueCards, dueCards.length >= limit);
    if (includeStats) {
      const stats = getSpacedRepetitionStats(filteredItems, direction);
      return json({
        ...response,
        stats
      });
    }
    return json(response);
  } catch (error) {
    console.error("[VocabularyAPI] Error loading due cards:", error);
    return json(
      {
        error: "Failed to load due cards",
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
