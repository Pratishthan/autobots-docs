import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  console.error("Set ELEVENLABS_API_KEY environment variable");
  process.exit(1);
}

const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel — change to preferred voice

type SceneScript = {
  id: string;
  narration: string;
};

function parseScript(filePath: string): SceneScript[] {
  const content = readFileSync(filePath, "utf-8");
  const scenes: SceneScript[] = [];
  const sceneRegex = /## Scene: (\w[\w\s&]*)\s*\(.*?\)\n\[Visual:.*?\]\n"([\s\S]*?)"/g;
  let match;

  while ((match = sceneRegex.exec(content)) !== null) {
    const id = match[1].toLowerCase().replace(/[\s&]+/g, "-");
    const narration = match[2].replace(/\n/g, " ").trim();
    scenes.push({ id, narration });
  }

  return scenes;
}

async function generateAudio(text: string, outputPath: string): Promise<void> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${await response.text()}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(outputPath, audioBuffer);
  console.log(`  Written: ${outputPath}`);
}

async function processScript(scriptFile: string, videoId: string): Promise<void> {
  const scriptPath = join("src", "scripts", scriptFile);
  const outputDir = join("public", "voiceover", videoId);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const scenes = parseScript(scriptPath);
  console.log(`\nProcessing ${scriptFile} (${scenes.length} scenes)`);

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const filename = `scene-${String(i + 1).padStart(2, "0")}-${scene.id}.mp3`;
    const outputPath = join(outputDir, filename);

    if (existsSync(outputPath)) {
      console.log(`  Skipping (exists): ${outputPath}`);
      continue;
    }

    await generateAudio(scene.narration, outputPath);
  }
}

// Process specific scripts or all
const args = process.argv.slice(2);
const scripts: Array<[string, string]> = [
  ["v1-intro.md", "v1-intro"],
  ["v2-background.md", "v2-background"],
  ["v3-data-models.md", "v3-data-models"],
  ["v4-services.md", "v4-services"],
  ["v5-flows.md", "v5-flows"],
  ["v6-lpus.md", "v6-lpus"],
  ["v7-test-data.md", "v7-test-data"],
  ["v8-test-scenarios.md", "v8-test-scenarios"],
];

const toProcess =
  args.length > 0
    ? scripts.filter(([file]) => args.some((a) => file.includes(a)))
    : scripts.filter(([file]) => existsSync(join("src", "scripts", file)));

for (const [file, id] of toProcess) {
  await processScript(file, id);
}

console.log("\nDone!");
