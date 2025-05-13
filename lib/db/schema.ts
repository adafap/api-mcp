import type { Document } from 'mongoose';
import { model, models, Schema } from 'mongoose';

// Chat Schema
interface ChatDocument extends Document {
  id: string;
  createdAt: Date;
  title: string;
  visibility: 'public' | 'private';
}

const chatSchema = new Schema<ChatDocument>({
  id: { type: String, required: true, unique: true },
  createdAt: { type: Date, required: true },
  title: { type: String, required: true },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private',
    required: true,
  },
});

// Message Schema
interface MessageDocument extends Document {
  id: string;
  chatId: string;
  role: string;
  parts: any;
  attachments: any;
  createdAt: Date;
}

const messageSchema = new Schema<MessageDocument>({
  id: { type: String, required: true, unique: true },
  chatId: { type: String, required: true },
  role: { type: String, required: true },
  parts: { type: Schema.Types.Mixed, required: true },
  attachments: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, required: true },
});

// App Schema
interface AppDocument extends Document {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  swaggerUrl: string;
  enabled: boolean;
  createdAt: Date;
}

const appSchema = new Schema<AppDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  swaggerUrl: { type: String, required: true },
  enabled: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

// DataSource Schema
interface DataSourceDocument extends Document {
  id: string;
  appId: string;
  title: string;
  description?: string;
  method?: string;
  path?: string;
  params?: any;
  createdAt: Date;
}

const dataSourceSchema = new Schema<DataSourceDocument>({
  id: { type: String, required: true, unique: true },
  appId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  method: { type: String },
  path: { type: String },
  params: { type: Schema.Types.Mixed },
  createdAt: { type: Date, required: true, default: Date.now },
});

// Export models
export const ChatModel = models.Chat || model<ChatDocument>('Chat', chatSchema);
export const Message =
  models.Message || model<MessageDocument>('Message', messageSchema);
export const AppModel = models.App || model<AppDocument>('App', appSchema);
export const DataSourceModel =
  models.DataSource ||
  model<DataSourceDocument>('DataSource', dataSourceSchema);

// Export types
export type { ChatDocument as Chat };
export type { MessageDocument as DBMessage };
export type { AppDocument as App };
export type { DataSourceDocument as DataSource };
