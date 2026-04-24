# S3 Upload Configuration Summary

## Status: ✅ All Media Outsourced to AWS S3

All uploadable content in your app is automatically sent to Amazon S3.

### What's Being Uploaded to S3

#### 1. **Profile Avatars** 
- Component: `components/social/EditProfileModal`
- Uploads user profile pictures to S3
- Stored URLs in `UserProfile.avatar_url`

#### 2. **Community Post Media**
- Component: `components/social/CreatePost` / `components/forums/FeedTab`
- Uploads photos and videos from community posts
- Stored URLs in `CommunityPost.media_url`
- Includes photo and video support with aspect ratio detection

#### 3. **Forum Posts with Media**
- Component: `components/forums/NewPostForm`
- Text-only posts (no media handling at this layer)

### Upload Flow

All uploads use the centralized function: `lib/uploadToS3.js`

```javascript
uploadFileToS3(file) → Backend function "uploadToS3" → AWS S3 → Returns public URL
```

### Environment Variables (Already Set)
- `AWS_ACCESS_KEY_ID` ✓
- `AWS_SECRET_ACCESS_KEY` ✓
- `AWS_S3_REGION` ✓
- `AWS_S3_BUCKET_NAME` ✓

### Backend Function
- **Function:** `functions/uploadToS3` (handles the actual S3 API calls)
- **Takes:** Base64 encoded file data, filename, file type
- **Returns:** Public S3 URL

## Key Benefits
✅ Files stored externally (no database bloat)
✅ Fast content delivery from S3
✅ Reduced server bandwidth usage
✅ Automatic public URLs for media serving
✅ Scalable for high-volume uploads

## Files Currently Using S3

| Component | Feature | Media Type |
|-----------|---------|-----------|
| EditProfileModal | User avatars | Images |
| CreatePost | Community posts | Photos/Videos |
| FeedTab | Forum feed posts | Photos/Videos |

**Total Coverage:** 100% of uploadable content → S3 ✓