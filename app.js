import { launch, executablePath } from 'puppeteer';
import { createCanvas } from 'canvas';
import fs from 'fs';
import http from "http";
import dotenv from 'dotenv';
dotenv.config();

// Function to delay for a specified amount of time
const delay = async (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

// Function to generate a canvas image with text

const drawStar = (ctx, cx, cy, outerRadius, innerRadius, points) => {
  const angle = (Math.PI / points);
  let rotation = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / points;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < points; i++) {
    x = cx + Math.cos(rotation) * outerRadius;
    y = cy + Math.sin(rotation) * outerRadius;
    ctx.lineTo(x, y);
    rotation += step;

    x = cx + Math.cos(rotation) * innerRadius;
    y = cy + Math.sin(rotation) * innerRadius;
    ctx.lineTo(x, y);
    rotation += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF'; // Set the color of the star
  ctx.fill();
};

// Function to draw a decoration based on style
const drawDecoration = (ctx, style) => {
  ctx.beginPath();
  switch (style.shape) {
    case 'circle':
      ctx.arc(style.x, style.y, style.size, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(style.x - style.size / 2, style.y - style.size / 2, style.size, style.size);
      break;
    case 'triangle':
      ctx.moveTo(style.x, style.y - style.size / 2);
      ctx.lineTo(style.x + style.size / 2, style.y + style.size / 2);
      ctx.lineTo(style.x - style.size / 2, style.y + style.size / 2);
      ctx.closePath();
      break;
    case 'star':
      drawStar(ctx, style.x, style.y, style.size / 2, style.size, 5);
      break;
    case 'heart':
      drawHeart(ctx, style.x, style.y, style.size);
      break;
    default:
      break;
  }
  ctx.fillStyle = style.color;
  ctx.fill();
};


const drawHeart = (ctx, x, y, size) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + size / 2, y - size / 2, x + size, y + size / 3, x, y + size);
  ctx.bezierCurveTo(x - size, y + size / 3, x - size / 2, y - size / 2, x, y);
  ctx.fillStyle = '#FF0000'; // Set the color of the heart
  ctx.fill();
};

// Function to generate unique bubble styles
const generateBubbleStyles = (count) => {
  const bubbleStyles = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 400; // Random x-coordinate within canvas width
    const y = Math.random() * 300; // Random y-coordinate within canvas height
    const size = Math.random() * 40 + 20; // Random size between 20 and 60
    const shape = ['circle', 'square', 'triangle', 'star', 'heart'][Math.floor(Math.random() * 5)]; // Random shape
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16); // Random color
    bubbleStyles.push({ x, y, size, shape, color });
  }
  return bubbleStyles;
};

// Function to generate a canvas image with text and decorations
const generateCanvasImage = async (text) => {
  const canvas = createCanvas(400, 300); // 4:3 aspect ratio
  const ctx = canvas.getContext('2d');

  // Generate random background color
  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  ctx.fillStyle = randomColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw glowing text

  // Array of unique bubble styles (shapes and colors)
  const bubbleStyles = generateBubbleStyles(100); // Generate 100 unique styles

  // Add unique decorations
  bubbleStyles.forEach((style) => {
    drawDecoration(ctx, style);
  });

  drawGlowingText(ctx, text, canvas.width / 2, canvas.height / 2, 'bold 80px Arial');

  // Save canvas image to a file
  // const imageFileName = `up.png`;

  const imageFileName = `up.png`; // Change the image file path
  const currentDir = new URL('.', import.meta.url).pathname; // Get current directory path
  const out = fs.createWriteStream(currentDir + '/' + imageFileName);

  // const out = fs.createWriteStream(imageFileName);
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  // Wait for the image file to be saved
  await new Promise((resolve, reject) => {
    out.on('finish', resolve);
    out.on('error', reject);
  });

  return imageFileName;
};

// Function to draw glowing text with multiple colors
// Function to draw glowing text with multiple colors
const drawGlowingText = (ctx, text, x, y, font) => {
  // Generate multiple colors for the glow effect
  const colors = generateGlowingColors();

  // Draw text multiple times with different colors and positions
  for (let i = 0; i < colors.length; i++) {
    ctx.font = font;
    ctx.fillStyle = colors[i];
    ctx.shadowColor = colors[i]; // Set shadow color to match text color
    ctx.shadowBlur = 5; // Set shadow blur radius
    ctx.textAlign = 'center';
    ctx.fillText(text, x + Math.random() * 10 - 5, y + Math.random() * 10 - 5); // Randomize position for glowing effect
  }

  // Draw the main text with a solid color
  ctx.fillStyle = '#FFFFFF'; // White color for main text
  ctx.shadowColor = 'transparent'; // Disable shadow for main text
  ctx.fillText(text, x, y); // Draw main text
};


// Function to generate multiple glowing colors
const generateGlowingColors = () => {
  const numColors = 10; // Number of colors for the glow effect
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    colors.push(randomColor());
  }
  return colors;
};

// Function to generate a random color
const randomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16); // Random hexadecimal color code
};

// Start of script

// Generate canvas image with text and decoration

// Function to draw a heart shape



// Function to wait for navigation with a timeout
const waitForNavigationWithTimeout = async (page, timeout) => {
  try {
    return Promise.race([
      page.waitForNavigation({ timeout }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Navigation timeout')), timeout))
    ]);
  } catch (error) {

  }
};


const readTextFile = (filePath) => {
  try {
    // Read file synchronously to ensure content is returned before proceeding
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  } catch (error) {
    console.error('Error reading file:', error);
    return null; // Return null if there's an error
  }
};

const fileContent = readTextFile('test.txt');

(async () => {
  try {
    // Launch a headless browser
    const browser = await launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH || executablePath()
          : executablePath(),
    });

    // Open a new page
    const page = await browser.newPage();

    // Navigate to the website and login
    await page.goto('https://sithuwili.com');
    await page.waitForSelector('a[href="https://sithuwili.com/login"]');
    await page.click('a[href="https://sithuwili.com/login"]');
    await page.waitForSelector('input[id="number"]');
    await page.type('input[id="number"]', '777611095');
    await page.type('input[id="password"]', '3d74B4A7');

    // Submit the login form by pressing Enter key
    await page.keyboard.press('Enter');

    // Wait for navigation to complete
    await waitForNavigationWithTimeout(page, 30000); // Increased timeout to 30 seconds

    // Loop to submit the form 10 times
    for (let i = 0; i < 10000000000000; i++) {
      // Go to the compose page
      await page.goto('https://sithuwili.com/compose');

      // Wait for the compose page to load
      await page.waitForSelector('form[action="submit_post.php"]');

      // Generate canvas image with text
      const text = `TEST ${i}`;
      const imageFileName = await generateCanvasImage(text);

      // Upload the image file to the form
      const fileInput = await page.$('input[type="file"]');
      await delay(2000)
      await fileInput.uploadFile(imageFileName);

      const options = ["zpzpozk4bb", "eprpye04ib", "ebzp5rkc1r"];
      const randomIndex = Math.floor(Math.random() * options.length);
      const randomCategory = options[randomIndex];


      // const fileContent = readTextFile('test.txt');

      // Fill out the form fields
      await page.select('select[name="parent"]', randomCategory);
      await page.type('input[name="title"]', `${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}__test${i}`); // Fill out the title field
      await page.type('textarea[name="content"]', fileContent); // Fill out the content field

      // Submit the form
      await page.click('button[type="submit"]');

      try {
        // Wait for navigation to complete
        await waitForNavigationWithTimeout(page, 1000); // Increased timeout to 30 seconds
        console.log(`Form ${i + 1} submitted : success`);
      } catch (error) {
        console.log(`Form ${i + 1} submitted : null`);
        // console.error(`Form ${i + 1} submission failed:`, error);
        continue; // Continue with the next iteration of the loop
      }

      // Wait for 2 seconds
      // await delay(3000);

      // Remove the image file
      fs.unlinkSync(imageFileName);
    }

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();

const server = http.createServer((req, res) => {
  const runningStatus = 'true'
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(runningStatus);
});

// Define the port to listen on
const PORT = process.env.PORT || 8000; // Use environment variable for port

// Listen on the defined port
server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
  console.log('Ready to go');
});
