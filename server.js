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

    const folder = `out_${Date.now()}`;
    fs.mkdirSync(folder);

    let list = [];

    for (let i = 0; i < lines.length; i++) {
      const file = `${folder}/${i}.mp4`;

      execSync(`ffmpeg -y -f lavfi -i color=c=black:s=1080x1920:d=3 \
      -vf "drawtext=text='${lines[i]}':fontcolor=white:fontsize=50:x=(w-text_w)/2:y=(h-text_h)/2" ${file}`);

      list.push(`file '${file}'`);
    }

    fs.writeFileSync(`${folder}/list.txt`, list.join("\n"));

    execSync(`ffmpeg -y -f concat -safe 0 -i ${folder}/list.txt -c copy ${folder}/final.mp4`);

    res.json({ video: `${folder}/final.mp4` });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000);
