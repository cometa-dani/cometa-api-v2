import { RequestHandler } from 'express';
import { prisma } from '../../dataBaseConnection';
import * as schemma from '../user.dto';
// import Jimp from 'jimp';


/**
 * TODO: implement pagination with cursors
 *
 * Retrieves a list of all users, including their associated data.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
// export const getUsers: RequestHandler = async (req, res, next) => {
//   try {
//     const queryParams = schemma.schemmaQueryParams.safeParse(req.query);
//     if (!queryParams.success) {
//       // Respond with a 400 status code and validation errors if the request body is invalid.
//       return res.status(400).json({ error: 'Validation failed', issues: queryParams['error'].issues });
//     }

//     // if no query params retrieves all users
//     // if (Object.values(queryParams.data)?.length === 0) {
//     //   // Fetch all users from the database, including associated data (likes, matches, friendships, notifications).
//     //   const users = await prisma.user.findMany({
//     //     include: {
//     //       photos: true,
//     //       likedEvents: true,
//     //       incomingFriendships: true,
//     //       outgoingFriendships: true,
//     //       incomingNotification: true
//     //     }
//     //   });

//     //   // Respond with a 200 status code and the list of users.
//     //   return res.status(200).json({ users: users });
//     // }

//     // else retrieve according to the queryParam
//     let uniqueUser !: User;
//     if (queryParams.data?.email) {
//       uniqueUser = await prisma.user.findUnique({ where: { email: queryParams.data.email } });
//     }
//     else if (queryParams.data?.username) {
//       uniqueUser = await prisma.user.findUnique({ where: { username: queryParams.data.username } });
//     }
//     else if (queryParams.data?.phone) {
//       uniqueUser = await prisma.user.findUnique({ where: { phone: queryParams.data.phone } });
//     }
//     // else if (queryParams.data?.users) {
//     //   prisma.user.findMany({ where: { username: { startsWith: queryParams.data.users } } });
//     // }

//     if (uniqueUser) {
//       res.status(200).json(uniqueUser);
//     }
//     else {
//       res.status(204).json({ message: 'user not exists' });
//     }
//   }
//   catch (error) {
//     next(error);
//   }
// };


/**
 * Retrieves user profile by uid, including their associated data.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
// export const getUserProfileInfoByUuIdWithFriendShips: RequestHandler = async (req, res, next) => {
//   try {
//     const urlParams = schemma.schemmaUrlParams.safeParse(req.params);

//     if (!urlParams.success) {
//       return res.status(400).json({ error: 'Validation error', issues: urlParams['error']?.issues });
//     }

//     const user = await prisma.user.findUnique({
//       where: { uid: urlParams.data.uid },
//       include: {
//         photos: true,
//         likedEvents: {
//           include: {
//             event: {
//               select: {
//                 photos: { take: 1, where: { order: 0 } },
//               }
//             }
//           },
//           orderBy: { id: 'desc' },
//           take: 5
//         },

//         // takes the last 3 incoming and outgoing friendships
//         incomingFriendships: {
//           where: {
//             OR: [{ receiverId: req.user.id }, { senderId: req.user.id }]
//           },
//           take: 3
//         },
//         outgoingFriendships: {
//           where: {
//             OR: [{ receiverId: req.user.id }, { senderId: req.user.id }]
//           },
//           take: 3
//         }
//       }
//     });

//     res.status(200).json({ ...user, maxNumPhotos: maxNumPhotosPerUser });
//   }
//   catch (error) {
//     // Pass any errors to the next middleware for error handling.
//     next(error);
//   }
// };


/**
 * Creates a new user based on the provided request data.
 *
 * @param req - The request object containing user data.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const createUser: RequestHandler = async (req, res, next) => {
  try {
    // Parse and validate the request body against a predefined schema.
    const reqBody = schemma.schemmaCreateUser.safeParse(req.body);

    if (!reqBody.success) {
      // Respond with a 400 status code and validation errors if the data is invalid.
      return res.status(400).json({ error: 'Validation failed', issues: reqBody['error'].issues });
    }

    // Check if a user with the same username or email already exists in the database.
    const userAlreadyExists = await prisma.user.findUnique({ where: { username: reqBody.data.username, email: reqBody.data.email } });

    if (userAlreadyExists) {
      // Respond with a 400 status code if the user already exists.
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a new user in the database using the provided data.
    const newUser = await prisma.user.create({
      data: {
        username: reqBody.data.username,
        email: reqBody.data.email,
        name: reqBody.data.name,
        uid: reqBody.data.uid,
        birthday: reqBody.data.birthday,
      }
    });

    // Respond with a 201 status code and the newly created user.
    res.status(201).json(newUser);
  }
  catch (error) {
    // Pass any errors to the next middleware for error handling.
    next(error);
  }
};


/**
 * Updates an existing user's information based on the provided data.
 * But does when uploading images
 *
 * @param req - The request object containing user data and target user ID.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const updateUser: RequestHandler = async (req, res, next) => {
  try {
    // Parse and validate the URL parameters and request body against predefined schemas.
    const urlID = schemma.schemmaUrlParams.safeParse(req.params);
    const reqBody = schemma.schemmaUpdateUser.safeParse(req.body);

    if (!urlID.success) {
      // Respond with a 400 status code and validation errors if URL parameters are invalid.
      return res.status(400).json({ error: 'Validation failed', issues: urlID['error'].issues });
    }
    if (!reqBody.success) {
      // Respond with a 400 status code and validation errors if the request body is invalid.
      return res.status(400).json({ error: 'Validation failed', issues: reqBody['error'].issues });
    }

    // Check if the user to update exists based on the provided ID.
    const userToUpdate = await prisma.user.findUnique({ where: { id: urlID.data.id } });

    if (!userToUpdate) {
      // Respond with a 400 status code if the user is not found.
      return res.status(400).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: urlID.data.id
      },
      data: {
        ...reqBody.data
      }
    });

    // Respond with a 201 status code and the updated user data.
    res.status(201).json(updatedUser);
  }
  catch (error) {
    // Pass any errors to the next middleware for error handling.
    next(error);
  }
};


/**
 * Uploads user's photos
 * @param req - The request object containing user data and the avatar image file.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
// export const uploadUserPhotos: RequestHandler = async (req, res, next) => {
//   try {
//     ThumbHash = !ThumbHash ? await import('thumbhash') : ThumbHash;

//     // Parse and validate the URL parameters against a predefined schema.
//     const urlParam = schemma.schemmaUrlParams.safeParse(req.params);
//     if (!urlParam.success) {
//       return res.status(400).json({ error: 'Validation failed', issues: urlParam['error'].issues });
//     }

//     const user = await prisma.user.findUnique({ where: { id: urlParam.data.id }, include: { photos: true } });
//     if (!user) {
//       return res.status(400).json({ error: 'User not found' });
//     }

//     // maximum allowed number of photos is already reached
//     if (user.photos.length === maxNumPhotosPerUser) {
//       return res.status(409).json({ error: 'Max number of photos already reached the limit' });
//     }

//     const incommingImgFiles = req.files as IFile[];
//     const remainingPhotos: number = maxNumPhotosPerUser - user.photos.length;

//     if (incommingImgFiles.length > remainingPhotos) {
//       return res.status(409).json({ error: 'Max number of photos exceeds the limit' });
//     }

//     const filesToUpload = incommingImgFiles.map(imgFile => {
//       return bucket.upload(imgFile.path, {
//         contentType: imgFile.mimetype,
//         public: true,
//         destination: `users/${user.uid}/photos/${imgFile.filename}`,
//         metadata: {
//           firebaseStorageDownloadTokens: imgFile.filename, // uuid
//           cacheControl: 'public, max-age=315360000',
//           contentType: imgFile.mimetype,
//         },
//       });
//     });

//     // uploads images
//     const uploadedFiles = await Promise.all(filesToUpload);

//     // get public download urls for images
//     const downloadUrls = await Promise.all(uploadedFiles.map(file => getDownloadURL(file[0])));

//     // generate the newPhotos object
//     const newPhotosWithThumbHashesPromises = downloadUrls.map(async (url, i) => {
//       try {
//         const image = (await Jimp.read(incommingImgFiles[i]?.path)).resize(100, 100).quality(60);
//         const { data, width, height } = image.bitmap;

//         const binaryThumbHash = ThumbHash.rgbaToThumbHash(width, height, data);
//         const thumbHashToBase64 = Buffer.from(binaryThumbHash).toString('base64');
//         // delete image from diskstorage
//         await fs.unlink(incommingImgFiles[i].path);
//         return {
//           url,
//           uuid: incommingImgFiles[i].filename,
//           placeholder: thumbHashToBase64,
//           order: user.photos?.length + i
//         };
//       }
//       catch (error) {
//         await fs.unlink(incommingImgFiles[i].path);
//         return {
//           url,
//           uuid: incommingImgFiles[i].filename,
//           placeholder: '9NYJHwQHiId1iImGeZeIR5eId1BnB4UG',
//           order: user.photos?.length + i
//         };
//       }
//     });

//     const newPhotos = await Promise.all(newPhotosWithThumbHashesPromises);

//     // store the newPhotos in the DB.
//     const updatedUser = await prisma.user.update({
//       where: {
//         id: user.id,
//       },
//       data: {
//         photos: {
//           createMany: { data: newPhotos },
//         }
//       },
//       include: { photos: true }
//     });

//     // Respond with a 200 status code and the updated user data.
//     res.status(200).json(updatedUser);
//   }
//   catch (error) {
//     // Pass any errors to the next middleware for error handling.
//     next(error);
//   }
// };


/**
 * Uploads user's photos
 * @param req - The request object containing user data and the avatar image file.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
// export const updateUserPhotos: RequestHandler = async (req, res, next) => {
//   try {
//     ThumbHash = !ThumbHash ? await import('thumbhash') : ThumbHash;

//     // Parse and validate the URL parameters against a predefined schema.
//     const urlParam = schemma.schemmaUrlParams.safeParse(req.params);

//     if (!urlParam.success) {
//       // Respond with a 400 status code and validation errors if URL parameters are invalid.
//       return res.status(400).json({ error: 'Validation failed', issues: urlParam['error'].issues });
//     }
//     // Check if the user exists based on the provided ID.
//     const user = await prisma.user.findUnique({ where: { id: urlParam.data.id }, include: { photos: true } });

//     if (!user) {
//       // Respond with a 400 status code if the user is not found.
//       return res.status(400).json({ error: 'User not found' });
//     }

//     // maximum allowed number of photos is already reached
//     if (user.photos.length === maxNumPhotosPerUser) {
//       return res.status(409).json({ error: 'Max number of photos already reached the limit' });
//     }

//     const incommingImgFiles = req.files as IFile[];
//     // const totalPhotosToProcess: number = incommingImgFiles.length + user.photos.length;


//     // from front-end side
//     //  formData.append(`files[${order}]`, imgFile);

//     incommingImgFiles.forEach(file => {
//       // Extract the order from the fieldname
//       const order = parseInt(file.fieldname.replace('files[', '').replace(']', ''));

//       // Now you have the order of the photo and can use it in your code
//       console.log(order);
//     });

//     // // the number of photos to be uploaded exceeds the allowed limit
//     // if (totalPhotosToProcess > maxNumPhotosPerUser) {
//     //   return res.status(409).json({ error: 'Max number of photos exceeds the limit' });
//     // }

//     // const filesToUpload = incommingImgFiles.map(imgFile => {
//     //   return bucket.upload(imgFile.path, {
//     //     contentType: imgFile.mimetype,
//     //     public: true,
//     //     destination: `users/${user.uid}/photos/${imgFile.filename}`,
//     //     metadata: {
//     //       firebaseStorageDownloadTokens: imgFile.filename,
//     //       cacheControl: 'public, max-age=315360000',
//     //       contentType: imgFile.mimetype,
//     //     },
//     //   });
//     // });

//     // // uploads images
//     // const uploadedFiles = await Promise.all(filesToUpload);

//     // // get public download urls for images
//     // const downloadUrls = await Promise.all(uploadedFiles.map(file => getDownloadURL(file[0])));

//     // // generate the newPhotos object
//     // const newPhotosPromises = downloadUrls.map(async (url, i) => {
//     //   const image = (await Jimp.read(incommingImgFiles[i].path)).resize(100, 100).quality(60);
//     //   const { data, width, height } = image.bitmap;
//     //   const binaryThumbHash = ThumbHash.rgbaToThumbHash(width, height, data);
//     //   const thumbHashToBase64 = Buffer.from(binaryThumbHash).toString('base64');

//     //   // delete image from diskstorage
//     //   await fs.unlink(incommingImgFiles[i].path);

//     //   return {
//     //     url,
//     //     uuid: incommingImgFiles[i].filename,
//     //     placeholder: thumbHashToBase64,
//     //     order: i
//     //   };
//     // });

//     // const newPhotos = await Promise.all(newPhotosPromises);

//     // // store the newPhotos in the DB.
//     // const updatedUser = await prisma.user.update({
//     //   where: {
//     //     id: user.id,
//     //   },
//     //   data: {
//     //     photos: {
//     //       //  TODO: should create or update the photos, implement the logic to update the photos
//     //       createMany: { data: newPhotos },
//     //     }
//     //   }
//     // });

//     // // Respond with a 200 status code and the updated user data.
//     res.status(200).json({});
//   }
//   catch (error) {
//     // Pass any errors to the next middleware for error handling.
//     next(error);
//   }
// };


/**
 * Delete user's photos
 * @param req - The request object containing user data and the avatar image file.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
// export const deleteUserPhotoByUuid: RequestHandler = async (req, res, next) => {
//   try {
//     const urlParams = schemma.schemmaUrlParams.safeParse(req.params);
//     if (!urlParams.success) {
//       return res.status(400).json({ error: 'Validation failed', issues: urlParams['error'].issues });
//     }

//     // Check if the user'photo exists based on the provided ID.
//     const user = await prisma.user.findUnique({ where: { id: urlParams.data.id }, include: { photos: true } });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const photoToDelete = user.photos.find(photo => photo.uuid === urlParams.data.uid);
//     if (!photoToDelete) {
//       return res.status(404).json({ error: 'photo not found' });
//     }

//     await Promise.all([
//       bucket
//         .file(`users/${user.uid}/photos/${urlParams.data.uid}`)
//         .delete(),
//       prisma.userPhoto.delete({ where: { id: photoToDelete.id } }),
//       prisma.userPhoto.updateMany({
//         where: {
//           userId: user.id,
//           order: { gte: photoToDelete.order }
//         },
//         data: {
//           order: { decrement: 1 }
//         }
//       })
//     ]);

//     res.status(204).json({ message: 'photo deleted successfully' });
//   }
//   catch (error) {
//     next(error);
//   }
// };


/**
 * Deletes a user by their ID. This includes deleting associated data and assets.
 * @param req - The request object containing the user's ID.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
// export const deleteUser: RequestHandler = async (req, res, next) => {
//   try {
//     // Parse and validate the URL parameters against a predefined schema.
//     const urlParam = schemma.schemmaUrlParams.safeParse(req.params);

//     if (!urlParam.success) {
//       // Respond with a 400 status code and validation errors if URL parameters are invalid.
//       return res.status(400).json({ error: 'Validation failed', issues: urlParam['error'].issues });
//     }

//     // Find the user to delete based on the provided ID.
//     const toDeleteUser = await prisma.user.findUnique({ where: { id: urlParam.data.id } });

//     if (!toDeleteUser) {
//       // Respond with a 400 status code if the user is not found.
//       return res.status(400).json({ message: 'User not found' });
//     }

//     // Delete the user's account from Firebase Authentication.
//     await auth.deleteUser(toDeleteUser.uid);

//     // Delete the user's data from the Prisma database.
//     await prisma.user.delete({ where: { id: toDeleteUser.id } });

//     // TODO: Implement logic to delete all the images that belong to this user.

//     // Respond with a 204 status code indicating successful deletion.
//     res.status(204).json({ message: 'User deleted successfully' });
//   }
//   catch (error) {
//     // Pass any errors to the next middleware for error handling.
//     next(error);
//   }
// };


// /**
//  * Deletes an asset associated with a user and updates the user's data.
//  * @param req - The request object containing user and asset information.
//  * @param res - The response object.
//  * @param next - The next middleware function.
//  */
// export const deleteAsset: RequestHandler = async (req, res, next) => {
//   try {
//     // Parse and validate the URL parameters against a predefined schema.
//     const urlParam = schemma.urlIdParams.safeParse(req.params);

//     if (!urlParam.success) {
//       // Respond with a 400 status code and validation errors if URL parameters are invalid.
//       return res.status(400).json({ error: 'Validation failed', issues: urlParam['error'].issues });
//     }

//     // Extract the asset ID from the URL parameters.
//     const uuidFile = urlParam.data.id;

//     // Find the user based on the provided ID.
//     const user = await prisma.user.findUnique({ where: { uid: urlParam.data.uid }, include: { photos: true }});

//     if (!user) {
//       // Respond with a 400 status code if the user is not found.
//       return res.status(400).json({ message: 'User not found' });
//     }

//     // Find the asset to delete based on the provided asset ID.
//     const assetToDelete = user.photos.find((photo) => photo.uuid === uuidFile);

//     if (!assetToDelete) {
//       // Respond with a 404 status code if the asset is not found.
//       return res.status(404).json({ message: 'Asset not found' });
//     }

//     // Delete the asset from Firebase Storage.
//     await bucket.file(`users/${user.uid}/${uuidFile}`).delete();

//     // Update the user's photos without the deleted asset.
//     const updatedUser = await prisma.user.update({
//       where: {
//         id: user.id,
//       },
//       data: {
//         photos: {
//           set: user.photos.filter(photo => photo['uuid'] !== uuidFile)
//         }
//       }
//     });

//     // Respond with a 200 status code and the updated user data.
//     res.status(200).json(updatedUser);
//   }
//   catch (error) {
//     // Pass any errors to the next middleware for error handling.
//     next(error);
//   }
// };
