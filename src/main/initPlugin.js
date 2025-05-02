const mupdfProps = {
    from: {
        text: [
          "pdf",
          "epub",
          "xps",
          "cbz",
          "mobi",
          "fb2",
          "svg",
          "png",
          "jpg",
          "bmp"
        ],
      },
      to: {
        text: [
         "cbz",
         "png",
         "pnm",
         "pgm",
         "ppm",
         "pam",
         "pbm",
         "pkm",
         "pcl",
         "pclm",
         "ps",
         "pwg",
         "pdf",
         "svg",
         "html",
         "xhtml",
         "text",
         "stext"
        ],
      }
}
import {execFile} from 'node:child_process';
import path from 'path';
import { join } from 'path';
import fs from 'fs'
const converterPath = join(__dirname, '../Plugins', 'mutool.exe');
export async function documentConvert(filename,inputPath,outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    const outputFormat = options.format;
    const args = [
      'convert',
      '-F',outputFormat,
      '-o',`${outputPath}\\${filename}.${outputFormat}`,
      inputPath
    ];

    execFile(converterPath, args, (error, stdout, stderr) => {
      if (error) {
        console.error('Conversion Error:', error);
        reject(new Error(`Conversion failed: ${error.message}`));
        return;
      }

      if (stderr) {
        console.error('Conversion stderr:', stderr);
        reject(new Error(`Conversion error: ${stderr}`));
        return;
      }

      // Check if output file was created
      if (!fs.existsSync(outputPath)) {
        reject(new Error('Output file was not created'));
        return;
      }

      resolve({
        success: true,
        outputPath,
        message: 'File converted successfully',
        stdout
      });
    });
  });
}
export function getSupportedFormats() {
  return {
    input: mupdfProps.from.text,
    output: mupdfProps.to.text
  };
}
// Add validation function for supported formats
export function isFormatSupported(format, type = 'input') {
  const formats = type === 'input' ? mupdfProps.from.text : mupdfProps.to.text;
  return formats.includes(format.toLowerCase());
}

// Update checkPluginInstalled to be more robust
export async function checkPluginInstalled() {
  try {
    const pluginPath = path.join('out', 'Plugins', 'mutool.exe');    
    const exists = fs.existsSync(pluginPath);
    if (!exists) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Plugin check failed:', error);
    return false;
  }
}