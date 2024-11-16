const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const uploadToS3 = async (file) => {
    if (!file) return null;

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `profile-pictures/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    try {
        const result = await s3.upload(params).promise();
        return result.Location;
    } catch (error) {
        console.error('S3 upload error:', error);
        return null;
    }
};

const deleteFromS3 = async (fileUrl) => {
    if (!fileUrl) return;

    try {
        const key = fileUrl.split('/').slice(-2).join('/');
        await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key
        }).promise();
    } catch (error) {
        console.error('S3 delete error:', error);
    }
};

module.exports = {
    uploadToS3,
    deleteFromS3
};
