const fs = require("fs");

// Load JSON file that contains an array of items
const items = JSON.parse(
  fs.readFileSync("../code/dev-zesty-v2.models.json", "utf-8")
);

// Transform each item's `settings` field
items.forEach((item, index) => {
  const oldSettings = item.settings;

  if (!Array.isArray(oldSettings)) return; // skip if already migrated or invalid

  const newSettings = {};

  oldSettings.forEach((setting) => {
    const key = setting.key;

    // Normalize list to values
    const values = setting.list || [];

    const cleanedValues = values.map((v) =>
      typeof v === "string" ? v.replace(/\s*:\s*/g, ":") : v
    );

    const credits = {};
    cleanedValues.forEach((v) => {
      credits[v] = 1; // or your logic
    });

    newSettings[key] = {
      title: setting.title,
      values: key !== "negative_prompt" ? cleanedValues : [setting.default],
      credits: cleanedValues.length ? credits : { [setting.default]: 1 },
      default:
        typeof setting.default === "string"
          ? setting.default.replace(/\s*:\s*/g, ":")
          : setting.default,
      type: setting.type,
    };

    // Remove undefined keys like empty credits
    Object.keys(newSettings[key]).forEach((k) => {
      if (newSettings[key][k] === undefined) {
        delete newSettings[key][k];
      }
    });
  });

  // Replace the old array with the new object
  item.settings = newSettings;
});

fs.writeFileSync(
  "new-models-collection.json",
  JSON.stringify(items, null, 2),
  "utf-8"
);
console.log("✅ All documents migrated successfully");
