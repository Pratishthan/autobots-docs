import { readFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";

const EDGE_TTS = "edge-tts";
const DEFAULT_VOICE = "en-US-AriaNeural";

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
    const id = match[1].toLowerCase().replace(/[\s&]+/g, "-").replace(/-+$/, "");
    const narration = match[2].replace(/\n/g, " ").trim();
    scenes.push({ id, narration });
  }

  return scenes;
}

function generateAudio(text: string, outputPath: string): void {
  // spawnSync with an args array passes each argument directly — no shell escaping needed
  const result = spawnSync(
    EDGE_TTS,
    ["--voice", DEFAULT_VOICE, "--text", text, "--write-media", outputPath],
    { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
  );

  if (result.error) {
    throw new Error(`Failed to spawn edge-tts: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`edge-tts exited with code ${result.status}: ${result.stderr}`);
  }

  console.log(`  Written: ${outputPath}`);
}

function processScript(scriptFile: string, videoId: string): void {
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

    generateAudio(scene.narration, outputPath);
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
  processScript(file, id);
}

console.log("\nDone!");
