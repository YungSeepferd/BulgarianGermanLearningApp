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
function generateChunkMetadata(items) {
  const chunkSize = 50;
  const totalChunks = Math.ceil(items.length / chunkSize);
  const chunks = [];
  for (let i = 0; i < totalChunks; i++) {
    const startIndex = i * chunkSize;
    const endIndex = Math.min(startIndex + chunkSize, items.length);
    const chunkItems = items.slice(startIndex, endIndex);
    chunks.push({
      name: i.toString(),
      level: getUniqueLevels(chunkItems)[0] || "A1",
      category: getUniqueCategories(chunkItems)[0] || "general",
      count: chunkItems.length,
      size: chunkItems.length,
      totalItems: chunkItems.length,
      levels: getUniqueLevels(chunkItems),
      categories: getUniqueCategories(chunkItems),
      description: `Chunk ${i + 1} of ${totalChunks} (${startIndex + 1}-${endIndex})`,
      lastModified: Date.now()
    });
  }
  const levels = getUniqueLevels(items);
  levels.forEach((level) => {
    const levelItems = items.filter((item) => item.level === level);
    if (levelItems.length > 0) {
      chunks.push({
        name: level,
        level,
        category: getUniqueCategories(levelItems)[0] || "general",
        count: levelItems.length,
        size: levelItems.length,
        totalItems: levelItems.length,
        levels: [level],
        categories: getUniqueCategories(levelItems),
        description: `All ${level} vocabulary items (${levelItems.length} items)`,
        lastModified: Date.now()
      });
    }
  });
  const categories = getUniqueCategories(items);
  const majorCategories = categories.filter(
    (cat) => items.filter((item) => item.category === cat).length >= 10
  );
  majorCategories.forEach((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    chunks.push({
      name: category,
      level: getUniqueLevels(categoryItems)[0] || "A1",
      category,
      count: categoryItems.length,
      size: categoryItems.length,
      totalItems: categoryItems.length,
      levels: getUniqueLevels(categoryItems),
      categories: [category],
      description: `All ${category} vocabulary items (${categoryItems.length} items)`,
      lastModified: Date.now()
    });
  });
  return chunks;
}
function getUniqueLevels(items) {
  const levels = new Set(items.map((item) => item.level));
  return Array.from(levels).sort();
}
function getUniqueCategories(items) {
  const categories = new Set(items.map((item) => item.category));
  return Array.from(categories).sort();
}
function getVocabularyStats(items) {
  const stats = {
    total: items.length,
    byLevel: {},
    byCategory: {},
    byDirection: {
      "bg-de": 0,
      "de-bg": 0
    },
    difficultyDistribution: {
      easy: 0,
      medium: 0,
      hard: 0
    },
    frequencyDistribution: {
      high: 0,
      medium: 0,
      low: 0
    }
  };
  items.forEach((item) => {
    stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1;
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    if (item.source_lang === "bg" && item.target_lang === "de") {
      stats.byDirection["bg-de"]++;
    } else if (item.source_lang === "de" && item.target_lang === "bg") {
      stats.byDirection["de-bg"]++;
    }
    if (item.difficulty !== void 0) {
      if (item.difficulty <= 2) {
        stats.difficultyDistribution.easy++;
      } else if (item.difficulty <= 4) {
        stats.difficultyDistribution.medium++;
      } else {
        stats.difficultyDistribution.hard++;
      }
    }
    if (item.frequency !== void 0) {
      if (item.frequency >= 80) {
        stats.frequencyDistribution.high++;
      } else if (item.frequency >= 50) {
        stats.frequencyDistribution.medium++;
      } else {
        stats.frequencyDistribution.low++;
      }
    }
  });
  return stats;
}
const GET = async ({ url }) => {
  try {
    const includeStats = url.searchParams.get("includeStats") === "true";
    const includeChunks = url.searchParams.get("includeChunks") !== "false";
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    const response = {
      timestamp: Date.now(),
      version: "1.0.0"
    };
    if (includeChunks) {
      response.chunks = generateChunkMetadata(validatedItems);
    }
    if (includeStats) {
      response.stats = getVocabularyStats(validatedItems);
      response.summary = {
        totalItems: validatedItems.length,
        totalChunks: Math.ceil(validatedItems.length / 50),
        levels: getUniqueLevels(validatedItems),
        categories: getUniqueCategories(validatedItems)
      };
    }
    return json(response);
  } catch (error) {
    console.error("[VocabularyAPI] Error loading metadata:", error);
    return json(
      {
        error: "Failed to load vocabulary metadata",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { includeStats = false, includeChunks = true, filters } = body;
    let validatedItems = vocabularyData.map(validateVocabularyItem);
    if (filters) {
      const { level, category, direction } = filters;
      if (level && level !== "all") {
        validatedItems = validatedItems.filter((item) => item.level === level);
      }
      if (category && category !== "all") {
        validatedItems = validatedItems.filter((item) => item.category === category);
      }
      if (direction) {
        validatedItems = validatedItems.filter(
          (item) => direction === "bg-de" && item.source_lang === "bg" || direction === "de-bg" && item.source_lang === "de"
        );
      }
    }
    const response = {
      timestamp: Date.now(),
      version: "1.0.0",
      filtered: !!filters
    };
    if (includeChunks) {
      response.chunks = generateChunkMetadata(validatedItems);
    }
    if (includeStats) {
      response.stats = getVocabularyStats(validatedItems);
      response.summary = {
        totalItems: validatedItems.length,
        totalChunks: Math.ceil(validatedItems.length / 50),
        levels: getUniqueLevels(validatedItems),
        categories: getUniqueCategories(validatedItems)
      };
    }
    return json(response);
  } catch (error) {
    console.error("[VocabularyAPI] Error loading metadata:", error);
    return json(
      {
        error: "Failed to load vocabulary metadata",
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
