import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple image optimization without external dependencies
async function optimizeImages() {
  console.log('🖼️  Starting image optimization...');
  
  const publicDir = path.join(__dirname, '../public');
  const uploadsDir = path.join(publicDir, 'lovable-uploads');
  const optimizedDir = path.join(publicDir, 'optimized');
  
  try {
    // Create optimized directory if it doesn't exist
    await fs.mkdir(optimizedDir, { recursive: true });
    
    // Read all files in lovable-uploads
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter(file => 
      /\.(png|jpg|jpeg|webp)$/i.test(file)
    );
    
    console.log(`📸 Found ${imageFiles.length} images to analyze`);
    
    // Check file sizes and report findings
    for (const file of imageFiles) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      
      if (sizeKB > 100) {
        console.log(`🚨 Large file detected: ${file} (${sizeKB}KB)`);
        
        // Special handling for the logo
        if (file === 'f440215b-ebf7-4c9f-9cf6-412d4018796e.png') {
          console.log(`⚠️  CRITICAL: Logo file is ${sizeKB}KB - should be < 50KB`);
          console.log(`   Please optimize this file using TinyPNG or Squoosh:`);
          console.log(`   - TinyPNG: https://tinypng.com/`);
          console.log(`   - Squoosh: https://squoosh.app/`);
        }
      } else {
        console.log(`✅ Good size: ${file} (${sizeKB}KB)`);
      }
    }
    
    // Create optimization report
    const report = {
      timestamp: new Date().toISOString(),
      totalImages: imageFiles.length,
      largeImages: imageFiles.filter(async file => {
        const stats = await fs.stat(path.join(uploadsDir, file));
        return stats.size > 100 * 1024;
      }),
      recommendations: [
        "Compress images over 100KB using TinyPNG or Squoosh",
        "Convert PNG images to WebP for better compression",
        "Resize images to appropriate display dimensions",
        "Use responsive images with srcset for different screen sizes"
      ]
    };
    
    await fs.writeFile(
      path.join(optimizedDir, 'optimization-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('📊 Optimization report created in /public/optimized/');
    
  } catch (error) {
    console.error('❌ Error during optimization:', error);
  }
}

// Performance check script
async function checkPerformance() {
  console.log('⚡ Running performance check...');
  
  const publicDir = path.join(__dirname, '../public');
  const uploadsDir = path.join(publicDir, 'lovable-uploads');
  
  let totalSize = 0;
  let imageCount = 0;
  
  try {
    const files = await fs.readdir(uploadsDir);
    
    for (const file of files) {
      if (/\.(png|jpg|jpeg|webp)$/i.test(file)) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
        imageCount++;
      }
    }
    
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    
    console.log(`📊 Performance Metrics:`);
    console.log(`   Total Images: ${imageCount}`);
    console.log(`   Total Size: ${totalSizeMB}MB`);
    
    if (totalSize > 10 * 1024 * 1024) {
      console.log(`🚨 WARNING: Total image size is very large (${totalSizeMB}MB)`);
      console.log(`   Recommended: < 5MB total`);
    } else {
      console.log(`✅ Total image size is acceptable`);
    }
    
  } catch (error) {
    console.error('❌ Error checking performance:', error);
  }
}

// Run the optimization
const command = process.argv[2];

if (command === 'check') {
  checkPerformance();
} else {
  optimizeImages();
}
