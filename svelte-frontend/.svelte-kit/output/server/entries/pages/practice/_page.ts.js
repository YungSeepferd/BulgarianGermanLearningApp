import { error } from "@sveltejs/kit";
const load = async ({ url }) => {
  try {
    return {
      // Provide default settings that can be overridden by client-side logic
      settings: {
        direction: "bg-de",
        // Default direction
        level: "A1",
        // Default level
        category: "all",
        // Default category
        limit: 10
        // Default limit
      },
      // Indicate that this is a static build
      isStaticBuild: true,
      serverTimestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error_) {
    console.error("[Practice Page Load] Error:", error_);
    if (error_ instanceof Error) {
      throw error(500, `Failed to load practice session: ${error_.message}`);
    }
    throw error(500, "An unexpected error occurred while loading the practice session");
  }
};
export {
  load
};
