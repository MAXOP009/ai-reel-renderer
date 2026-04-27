const express = require("express");
const { execSync } = require("child_process");
const fs = require("fs");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Renderer is running");
});

app.post("/render", async (req, res) => {
  try {
    const lines = req.body.lines || [];
    const id = Date.now();
    const folder = `out_${id}`;
    fs.mkdirSync(folder);

    let list = [];

    for (let i = 0; i < lines.length; i++) {
      const text = lines[i].replace(/'/g, "");

      // 🔊 Generate voice using gTTS
      const audio = `${folder}/audio_${i}.mp3`;
      execSync(`python3 -m gtts.cli "${text}" --output ${audio}`);

      const video = `${folder}/clip_${i}.mp4`;

      execSync(`
        ffmpeg -y -loop 1 -i /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf \
        -i ${audio} \
        -vf "drawtext=text='${text}':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2" \
        -t 3 -pix_fmt yuv420p ${video}
      `);

      list.push(`file '${video}'`);
    }

    fs.writeFileSync(`${folder}/list.txt`, list.join("\n"));

    execSync(`ffmpeg -y -f concat -safe 0 -i ${folder}/list.txt -c copy ${folder}/final.mp4`);

    res.json({
      video: `${folder}/final.mp4`
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000);
