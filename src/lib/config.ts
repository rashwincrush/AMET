export const storageConfig = {
  buckets: {
    profilePictures: {
      name: 'profile-pictures',
      public: true,
      policies: {
        insert: {
          allowedOrigins: ['*'],
          allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          maxSize: 5 * 1024 * 1024 // 5MB
        }
      }
    }
  }
};
