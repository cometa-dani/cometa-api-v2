import { Router } from 'express';
import * as controller from './old.controller';


export const userRouter = Router();

userRouter
  .route('/')
  // .get(controller.getUsers)
  .post(controller.createUser);

// userRouter
//   .route('/search')
//   .get()

userRouter
  .route('/:id')
  .patch(controller.updateUser);
// .delete(controller.deleteUser);

// userRouter;
// .get('/:uid', authMiddleware, controller.getUserProfileInfoByUuIdWithFriendShips);


// TODO, we can use formData to upload the avatar img together with the user data
// sets the avatar img for every new created user
// userRouter
//   .patch('/:id/avatar', fileUploadMiddleware.single('file'), controller.uploadUserAvatarImg);
// userRouter;
// .post('/:id/photos', fileUploadMiddleware.any(), controller.uploadUserPhotos)
// .patch('/:id/photos', fileUploadMiddleware.any(), controller.updateUserPhotos)
// .delete('/:id/photos/:uid', controller.deleteUserPhotoByUuid);

// eyJhbGciOiJSUzI1NiIsImtpZCI6IjUzZWFiMDBhNzc5MTk3Yzc0MWQ2NjJmY2EzODE1OGJkN2JlNGEyY2MiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY29tZXRhLWU1ZGQ1IiwiYXVkIjoiY29tZXRhLWU1ZGQ1IiwiYXV0aF90aW1lIjoxNzA2OTgzNDc0LCJ1c2VyX2lkIjoiWUVRS2NwSE9iak02MHhiU0pDa0VVdFo1OE1YMiIsInN1YiI6IllFUUtjcEhPYmpNNjB4YlNKQ2tFVXRaNThNWDIiLCJpYXQiOjE3MDY5ODM0NzQsImV4cCI6MTcwNjk4NzA3NCwiZW1haWwiOiJhbmFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFuYUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.VwMDGK7QPjbNp4E2P9C1enFcJ2N - pVF1 - s3AViUnAkW0hj_6rPFln - ViuQKM0y92zxEbnt7DLoLYBo5rZBDDNjvlMheaxX_T9bnkQpU_T1pGhHMYL6BbdE1wiQqOiqNQNDA54nfZerK2NyLuHeAjM9pNDbPQ4m1ZyFNrhdeN3MZ8j6_LB_gu8xpHTptkz - AChvlmfS79tmfUDHAoNtPfQmgs0gne9TSwRf28fu6rW9QTcyuPmDGpLXjGzYIZbNWtXhpuVb0Kelde9oDjoRxf1unC3JhHpuzcqv0O_GzArcRAzXhR - PemnyukX2C0BLLs9foLfiLrKE7XM8ZxhMvFdg
