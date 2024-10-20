import { Container, Service } from 'typedi';
import { EventParamsDto, GetAllEventsDTO, SearchByNameDto, SearchEventsDTO } from './event.dto';
import { TypedRequestHandlerBody, TypedRequestHandlerQuery } from '../helpers/typeRequestHandlers';
import { EventService } from './event.service';
import { BaseController } from '../helpers/basecontroller';


@Service()
export class EventController extends BaseController {

  private _eventService = Container.get(EventService);


  public getUsersWhoLikedSameEventWithPagination: TypedRequestHandlerQuery<GetAllEventsDTO, object, EventParamsDto> = async (req, res, next) => {
    try {
      const { limit, cursor } = req.query;
      const [totalCount, usersList] = await this._eventService.getUsersWhoLikedSameEvent(req.params.id, req.user.id, req.query);
      // since we are counting down from the latest items in the table,
      // when we reach the first item, we should stop looking for the next cursor.
      const nextCursor = usersList.at(-1)?.id === 1 ? null : usersList.at(-1)?.id ?? null;

      return this.ok(res, {
        usersWhoLikedEvent: cursor > 0 ? usersList.slice(1) : usersList,
        nextCursor,
        totalUsers: totalCount,
        hasNextCursor: nextCursor !== null || usersList.length < limit,
        usersPerPage: limit,
      });
    }
    catch (error) {
      next(error);
    }
  };


  public searchEventsByName: TypedRequestHandlerQuery<SearchByNameDto> = async (req, res, next) => {
    try {
      const { limit = 10, cursor = 0 } = req.query;
      const [events, count] = await this._eventService.searchEventsByName(req.query);
      const nextCursor: number = events.at(-1)?.id === 1 ? null : events.at(-1)?.id ?? null;

      const paginatedEvents = {
        events: cursor > 0 ? events.slice(1) : events,
        totalEvents: count,
        nextCursor,
        eventsPerPage: limit,
      };

      return this.ok(res, paginatedEvents);
    }
    catch (error) {
      next(error);
    }
  };


  public searchLatestEventsWithPagination: TypedRequestHandlerQuery<SearchEventsDTO> = async (req, res, next) => {
    try {
      const { limit = 10, cursor = 0 } = req.query;
      const [events, count] = await this._eventService.searchLatestEventsWithPagination(req.query, req.user.id);
      const nextCursor: number = events?.at(-1)?.id === 1 ? null : events.at(-1)?.id ?? null;

      const paginatedEvents = {
        events: cursor > 0 ? events.slice(1) : events,
        totalEvents: count,
        nextCursor,
        hasNextCursor: nextCursor !== null || events.length < limit,
        eventsPerPage: limit,
      };

      return this.ok(res, paginatedEvents);
    }
    catch (error) {
      next(error);
    }
  };


  public createEventByLocation: TypedRequestHandlerBody = async (req, res, next) => {
    try {
      // ThumbHash = !ThumbHash ? await import('thumbhash') : ThumbHash;

      // Parse and validate the event data from the request body
      // const eventData = schemma.createEvent.safeParse(req.body);

      // Check if data validation was successful
      // if (!eventData.success) {
      //   return res.status(400).json({ error: 'Validation failed', issues: eventData['error'].issues });
      // }

      // const incommingImgFiles = req.files as IFile[];
      // const totalPhotosToProcess: number = incommingImgFiles.length;

      // // the number of photos to be uploaded exceeds the allowed limit
      // if (totalPhotosToProcess > maxNumPhotosPerEvent) {
      //   return res.status(409).json({ error: 'Max number of photos exceeds the limit' });
      // }

      // const createdEvent = await prisma.event.create({
      //   data: ({
      //     name: eventData.data.name,
      //     description: eventData.data.description,
      //     date: new Date(eventData.data.date),
      //     // later on, only athenticated organizations can create events
      //     // at a given locationID
      //     locationId: eventData.data.locationId,
      //     organizationId: eventData.data.organizationId,
      //     categories: eventData.data.categories,
      //   }),
      // });

      // // const uuidFile = randomUUID();
      // const filesToUpload = incommingImgFiles.map(imgFile => {
      //   return bucket.upload(imgFile.path, {
      //     contentType: imgFile.mimetype,
      //     public: true,
      //     destination: `organizations/${createdEvent.organizationId}/events/${createdEvent.id}/${imgFile.filename}`,
      //     metadata: {
      //       firebaseStorageDownloadTokens: imgFile.filename,
      //       cacheControl: 'public, max-age=315360000',
      //       contentType: imgFile.mimetype,
      //     },
      //   });
      // });

      // // uploads images
      // const uploadedFiles = await Promise.all(filesToUpload);

      // // get public download urls for images
      // const downloadUrls = await Promise.all(uploadedFiles.map(file => getDownloadURL(file[0])));

      // // generate the newPhotos object
      // const newPhotosPromises = downloadUrls.map(async (url, i) => {
      //   // const image = (await Jimp.read(incommingImgFiles[i].path)).resize(100, 100).quality(60); // set JPEG quality;
      //   const { data, width, height } = image.bitmap;
      //   const binaryThumbHash = ThumbHash.rgbaToThumbHash(width, height, data);
      //   const thumbHashToBase64 = Buffer.from(binaryThumbHash).toString('base64');

      //   // delete image from diskstorage
      //   await fs.unlink(incommingImgFiles[i].path);

      //   return {
      //     url,
      //     uuid: incommingImgFiles[i].filename,
      //     placeholder: thumbHashToBase64,
      //     order: i
      //   };
      // });

      // const newPhotos = await Promise.all(newPhotosPromises);

      // // update the event record with the new photos
      // const updatedEvent = await prisma.event.update({
      //   data: {
      //     photos: {
      //       createMany: { data: newPhotos }
      //     }
      //   },
      //   where: {
      //     id: createdEvent.id
      //   }
      // });

      // res.status(201).json(updatedEvent);
    }
    catch (error) {
      next(error);
    }
  };
}
