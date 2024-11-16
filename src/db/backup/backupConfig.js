const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

class DatabaseBackup {
  constructor() {
    this.s3 = new AWS.S3();
    this.backupPath = path.join(__dirname, 'backups');
    this.bucketName = process.env.BACKUP_BUCKET_NAME;
  }

  async performBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(this.backupPath, filename);

    try {
      await this.createBackupDirectory();
      await this.dumpDatabase(filepath);
      await this.uploadToS3(filepath, filename);
      await this.cleanupOldBackups();
      logger.info(`Backup completed successfully: ${filename}`);
    } catch (error) {
      logger.error('Backup failed:', error);
      throw error;
    }
  }

  async createBackupDirectory() {
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  async dumpDatabase(filepath) {
    return new Promise((resolve, reject) => {
      const command = `PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -F c -f ${filepath}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async uploadToS3(filepath, filename) {
    const fileStream = fs.createReadStream(filepath);
    const uploadParams = {
      Bucket: this.bucketName,
      Key: `db-backups/${filename}`,
      Body: fileStream
    };

    await this.s3.upload(uploadParams).promise();
    fs.unlinkSync(filepath);
  }

  async cleanupOldBackups() {
    const params = {
      Bucket: this.bucketName,
      Prefix: 'db-backups/'
    };

    const response = await this.s3.listObjects(params).promise();
    const objects = response.Contents
      .sort((a, b) => b.LastModified - a.LastModified)
      .slice(5); // Keep the 5 most recent backups

    if (objects.length > 0) {
      await this.s3.deleteObjects({
        Bucket: this.bucketName,
        Delete: { Objects: objects.map(obj => ({ Key: obj.Key })) }
      }).promise();
    }
  }

  async restoreFromBackup(backupFile) {
    const downloadPath = path.join(this.backupPath, backupFile);

    try {
      await this.downloadFromS3(backupFile, downloadPath);
      await this.restoreDatabase(downloadPath);
      fs.unlinkSync(downloadPath);
      logger.info(`Database restored successfully from ${backupFile}`);
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }

  async downloadFromS3(backupFile, downloadPath) {
    const params = {
      Bucket: this.bucketName,
      Key: `db-backups/${backupFile}`
    };

    const fileStream = fs.createWriteStream(downloadPath);
    const s3Stream = this.s3.getObject(params).createReadStream();

    return new Promise((resolve, reject) => {
      s3Stream.pipe(fileStream)
        .on('error', reject)
        .on('finish', resolve);
    });
  }

  async restoreDatabase(backupPath) {
    return new Promise((resolve, reject) => {
      const command = `PGPASSWORD=${process.env.DB_PASSWORD} pg_restore -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -c ${backupPath}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new DatabaseBackup();