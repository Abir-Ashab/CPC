import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PhotoService } from 'src/modules/photo/photo.service';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TEMP_DOWNLOAD_DIR = path.join(__dirname, 'temp_downloads');

interface ParticipantSubmission {
  timestamp: string;
  email: string;
  name: string;
  slackId: string;
  teamName: string;
  captions: string[];
  photoFileIds: string[];
}

async function authorize(): Promise<any> {
  let credentials;
  try {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  } catch (error) {
    console.error('\nError: credentials.json not found!');
    console.error('\nSetup Instructions:');
    console.error('1. Go to https://console.cloud.google.com/');
    console.error('2. Enable Google Drive API and Google Sheets API');
    console.error('3. Create OAuth 2.0 credentials (Desktop app)');
    console.error('4. Download and save as credentials.json in backend folder');
    console.error('\nSee GOOGLE_DRIVE_SYNC_GUIDE.md for detailed instructions.\n');
    process.exit(1);
  }

  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (error) {
    return getAccessToken(oAuth2Client);
  }
}

async function getAccessToken(oAuth2Client: any): Promise<any> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔐 === Google Authorization Required ===');
  console.log('\n📌 Please authorize this app by visiting this URL:\n');
  console.log(authUrl);
  console.log('\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('✏️  Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err: any, token: any) => {
        if (err) {
          console.error('Error retrieving access token:', err);
          return reject(err);
        }
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log('✅ Token saved to', TOKEN_PATH);
        resolve(oAuth2Client);
      });
    });
  });
}

async function getFormResponsesFromSheet(sheets: any, spreadsheetId: string): Promise<ParticipantSubmission[]> {
  console.log('📊 Reading form responses from Google Sheet...');
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: 'A:I', 
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return [];
  }

  const submissions: ParticipantSubmission[] = [];
  const headers = rows[0]; 
  
  console.log('\nForm Structure Detected:');
  headers.forEach((header: string, index: number) => {
    console.log(`  Column ${index}: ${header}`);
  });

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    const timestampIndex = headers.findIndex((h: string) => h.toLowerCase().includes('timestamp'));
    const emailIndex = headers.findIndex((h: string) => h.toLowerCase().includes('email'));
    const nameIndex = headers.findIndex((h: string) => h.toLowerCase().includes('name'));
    const slackIndex = headers.findIndex((h: string) => h.toLowerCase().includes('slack'));
    const teamIndex = headers.findIndex((h: string) => h.toLowerCase().includes('team'));
    const caption1Index = headers.findIndex((h: string) => h.toLowerCase().includes('caption') && h.includes('1'));
    const caption2Index = headers.findIndex((h: string) => h.toLowerCase().includes('caption') && h.includes('2'));
    const caption3Index = headers.findIndex((h: string) => h.toLowerCase().includes('caption') && h.includes('3'));
    const uploadIndex = headers.findIndex((h: string) => h.toLowerCase().includes('upload') || h.toLowerCase().includes('masterpiece'));

    const submission: ParticipantSubmission = {
      timestamp: row[timestampIndex] || '',
      email: row[emailIndex] || '',
      name: row[nameIndex] || '',
      slackId: row[slackIndex] || '',
      teamName: row[teamIndex] || '',
      captions: [
        row[caption1Index] || '',
        row[caption2Index] || '',
        row[caption3Index] || '',
      ].filter(c => c),
      photoFileIds: extractFileIdsFromCell(row[uploadIndex] || ''),
    };

    if (submission.email && submission.photoFileIds.length > 0) {
      submissions.push(submission);
    }
  }

  return submissions;
}

function extractFileIdsFromCell(cellValue: string): string[] {  
  const fileIds: string[] = [];
  const urlPattern = /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/g;
  
  let match;
  while ((match = urlPattern.exec(cellValue)) !== null) {
    fileIds.push(match[1]);
  }

  return fileIds;
}

async function downloadFile(drive: any, fileId: string, destPath: string): Promise<void> {
  const dest = fs.createWriteStream(destPath);
  const response = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return new Promise((resolve, reject) => {
    response.data
      .on('end', () => resolve())
      .on('error', (err: any) => reject(err))
      .pipe(dest);
  });
}

async function getFileName(drive: any, fileId: string): Promise<string> {
  const response = await drive.files.get({
    fileId: fileId,
    fields: 'name',
  });
  return response.data.name || 'unknown.jpg';
}

async function syncFromGoogleForm() {
  console.log('\n === Google Form Photo Sync ===\n');

  if (!fs.existsSync(TEMP_DOWNLOAD_DIR)) {
    fs.mkdirSync(TEMP_DOWNLOAD_DIR, { recursive: true });
  }

  console.log('Authorizing with Google...');
  const auth = await authorize();
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!spreadsheetId) {
    console.log('\nTo find your Spreadsheet ID:');
    console.log('1. Open your Google Form');
    console.log('2. Go to "Responses" tab');
    console.log('3. Click the Google Sheets icon to view responses');
    console.log('4. Copy the ID from the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit\n');

    spreadsheetId = await new Promise<string>((resolve) => {
      rl.question('📋 Enter the Google Sheets Spreadsheet ID: ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  } else {
    console.log(`\n✅ Using Spreadsheet ID from .env file`);
    rl.close();
  }

  const submissions = await getFormResponsesFromSheet(sheets, spreadsheetId);
  
  console.log(`\n✅ Found ${submissions.length} participant submission(s)\n`);

  const app = await NestFactory.createApplicationContext(AppModule);
  const photoService = app.get(PhotoService);

  let totalUploaded = 0;
  let totalFailed = 0;
  let skippedCount = 0;
  let participantCount = 0;

  for (const submission of submissions) {
    participantCount++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📸 Participant ${participantCount}: ${submission.name}`);
    console.log(`📧 Email: ${submission.email}`);
    console.log(`👤 Slack ID: ${submission.slackId}`);
    console.log(`🏢 Team: ${submission.teamName}`);
    console.log(`📁 Photos to upload: ${submission.photoFileIds.length}`);
    console.log(`${'='.repeat(60)}`);

    const existingCount = await photoService.getParticipantPhotoCount(submission.email);
    if (existingCount > 0) {
      console.log(`\n Participant already exists in database!`);
      console.log(`   Found ${existingCount} existing photo(s) for ${submission.email}`);
      console.log(`   Skipping to avoid duplicates...\n`);
      skippedCount++;
      continue;
    }    for (let i = 0; i < submission.photoFileIds.length; i++) {
      const fileId = submission.photoFileIds[i];
      const caption = submission.captions[i] || `Photo ${i + 1}`;

      try {
        const originalFileName = await getFileName(drive, fileId);
        const localPath = path.join(TEMP_DOWNLOAD_DIR, `${Date.now()}_${originalFileName}`);
        
        console.log(`\n  📥 Downloading: ${originalFileName}...`);
        await downloadFile(drive, fileId, localPath);
        
        const fileBuffer = fs.readFileSync(localPath);
        const stats = fs.statSync(localPath);
        
        const file: Express.Multer.File = {
          fieldname: 'file',
          originalname: originalFileName,
          encoding: '7bit',
          mimetype: getMimeType(originalFileName),
          buffer: fileBuffer,
          size: stats.size,
          stream: null,
          destination: '',
          filename: '',
          path: '',
        };

        console.log(`  Uploading to MinIO/MongoDB...`);
        console.log(`  Caption: "${caption}"`);
        
        await photoService.uploadPhoto(
          file,
          submission.email,
          caption,
          {
            email: submission.email,
            name: submission.name,
            slackId: submission.slackId,
            team: submission.teamName,
            caption: caption,
          }
        );
        
        console.log(`  ✅ Successfully uploaded!`);
        totalUploaded++;
        
        fs.unlinkSync(localPath);
      } catch (error) {
        console.error(`  Failed to process photo ${i + 1}:`, error.message);
        totalFailed++;
      }
    }
  }

  if (fs.existsSync(TEMP_DOWNLOAD_DIR)) {
    fs.rmdirSync(TEMP_DOWNLOAD_DIR, { recursive: true });
  }

  console.log('\n' + '='.repeat(60));
  console.log('='.repeat(60));
  console.log(`Total participants processed: ${participantCount}`);
  console.log(`Successfully uploaded: ${totalUploaded}`);
  console.log(`Skipped (already in DB): ${skippedCount}`);
  console.log(`Failed: ${totalFailed}`);
  console.log('='.repeat(60) + '\n');

  await app.close();
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

syncFromGoogleForm()
  .then(() => {
    console.log('Sync completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nError during sync:', error);
    process.exit(1);
  });