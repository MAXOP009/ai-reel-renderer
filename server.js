const express = require("express");
const { execSync } = require("child_process");
const fs = require("fs");

const app = express();
app.use(express.json());

// ✅ test route
app.get("/", (req, res) => {
  res.send("Renderer is running");
});

// ✅ IMPORTANT: THIS IS WHAT YOU ARE MISSING
app.post("/render", (req, res) => {
  try {
    const lines = req.body.lines || [];

    if (!lines.length) {
      return res.status(400).json({ error: "No lines provided" });
    }

    const id = Date.now();
    const folder = `out_${id}`;
    fs.mkdirSync(folder);

    let list = [];

    for (let i = 0; i < lines.length; i++) {
      const text = lines[i].replace(/'/g, "");

      const video = `${folder}/clip_${i}.mp4`;

      execSync(`
        ffmpeg -y -f lavfi -i color=c=black:s=720x1280:d=3 \
        -vf "drawtext=text='${text}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2" \
        ${video}
      `);

      list.push(`file '${video}'`);
    }

    fs.writeFileSync(`${folder}/list.txt`, list.join("\n"));

    execSync(`ffmpeg -y -f concat -safe 0 -i ${folder}/list.txt -c copy ${folder}/final.mp4`);

    res.json({
      status: "success",
      video: `${folder}/final.mp4`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
