const fs = require("fs");
const path = require("path");
const { banGuard, limitGuard } = require("../middleware/guards");

const registry = {};

function loadFilesRecursive(dir, bot) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      loadFilesRecursive(fullPath, bot);
      continue;
    }

    if (
      !entry.isFile() ||
      !entry.name.endsWith(".js") ||
      entry.name === "commands.js"
    )
      continue;

    const plugin = require(fullPath);
    const relativePath = path.relative(__dirname, fullPath);

    if (typeof plugin.run !== "function") {
      console.warn(`⚠️  Skipped (no run): ${relativePath}`);
      continue;
    }

    const triggers = [plugin.name, ...(plugin.alias || [])].filter(Boolean);

    if (triggers.length === 0) {
      console.warn(`⚠️  Skipped (no name): ${relativePath}`);
      continue;
    }

    // Simpan ke registry
    const cat = plugin.category || "general";
    if (!registry[cat]) registry[cat] = [];
    registry[cat].push({
      name: plugin.name,
      alias: plugin.alias || [],
      description: plugin.description || "",
      usage: plugin.usage || `/${plugin.name}`,
      useLimit: plugin.useLimit || false,
    });

    for (const trigger of triggers) {
      const pattern = new RegExp(`^\\/${trigger}(\\s+.*)?$`, "i");

      bot.onText(pattern, (msg, match) => {
        const chatId = msg.chat.id;
        const args = (match[1] || "").trim().split(/\s+/).filter(Boolean);
        const fullArgs = (match[1] || "").trim();

        const execute = () => {
          plugin.run({ bot, msg, chatId, args, fullArgs }).catch((err) => {
            console.error(`❌ Error in ${trigger}:`, err.message);
            bot.sendMessage(
              chatId,
              `❌ Terjadi error pada command \`/${trigger}\``,
              { parse_mode: "Markdown" },
            );
          });
        };

        // Selalu cek ban terlebih dahulu
        banGuard(bot, msg, () => {
          // Kalau plugin punya useLimit: true, cek & kurangi limit
          if (plugin.useLimit) {
            limitGuard(bot, msg, () => execute());
          } else {
            execute();
          }
        });
      });
    }

    const limitTag = plugin.useLimit ? " [limit]" : "";
    console.log(
      `✅ Loaded [${cat}]${limitTag} ${relativePath} → /${triggers.join(", /")}`,
    );
  }
}

function registerCommands(bot) {
  loadFilesRecursive(__dirname, bot);
}

function getRegistry() {
  return registry;
}

module.exports = { registerCommands, getRegistry };
