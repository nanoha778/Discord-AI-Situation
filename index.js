import express from "express";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import cron from "node-cron";
import { generateScenario } from "./aiClient.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(3000, () => console.log("✅ Pingサーバー起動"));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName("scenario")
    .setDescription("RP用シチュエーション案をAIで生成")
    .addStringOption((option) =>
      option
        .setName("テーマ")
        .setDescription("例: ツンデレ、甘えん坊、エッチなごっこ遊び など")
        .setRequired(false),
    ),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
const GUILD_ID = process.env.GUILD_ID;

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, GUILD_ID),
      { body: commands },
    );
    console.log("✅ ギルドSlashコマンド登録完了");
  } catch (err) {
    console.error("Slashコマンド登録失敗:", err);
  }
})();

client.once("ready", () => {
  console.log(`🤖 Botログイン成功: ${client.user.tag}`);

  cron.schedule(process.env.CRON_SCHEDULE, async () => {
    const prompt =
      "VRChatメスガキ宅で使えるRPシチュエーション案を3つ教えてください。";
    const text = await generateScenario(prompt);
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    channel.send(text);
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "scenario") {
    await interaction.deferReply();

    const theme = interaction.options.getString("テーマ");

    const prompt = `
ロールプレイに使えるシチュエーション案を3つ考えてください。
ジャンルやキャラクターの設定はテーマに沿って自由に発想して構いません。
即興演技がしやすいよう、シチュエーションは短く、わかりやすく提示してください。
${theme ? `【テーマ】: ${theme}` : ""}
`.trim();

    const text = await generateScenario(prompt);
    await interaction.editReply({ content: text });
  }
});

client.login(process.env.DISCORD_TOKEN);
