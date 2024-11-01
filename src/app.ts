import 'reflect-metadata';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { nodeEnv } from './vars';
import { defaultErrorMiddleware } from './middlewares/defaultErrorMiddleware';
// routers
import { worldCitiesRouter } from './worldcities/worldcities.router';
import organizationRouter from './organization/organization.router';
import chatGroupRouter from './chatGroup/chat-group.router';
import userRouter from './user/user.router';
import friendShipRouter from './friendship/friendship.router';
import eventRouter from './event/event.router';


export const app = express();

// 1. middlewares
if (nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

// app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/v1/events', eventRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/friendships', friendShipRouter);
app.use('/api/v1/organizations', organizationRouter);
app.use('/api/v1/chat-groups', chatGroupRouter);
app.use('/api/v1/world-cities', worldCitiesRouter);

// 3. defaultErrorHandler middleware
app.use('/api/v1/', defaultErrorMiddleware);
