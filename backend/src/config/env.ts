import * as dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
  PORT: string;
  MONGODB_URI: string;
  MINIO: {
    MINIO_ENDPOINT: string;
    MINIO_PORT: string;
    MINIO_ACCESS_KEY: string;
    MINIO_SECRET_KEY: string;
    MINIO_BUCKET_NAME: string;
    MINIO_USE_SSL: string;
  };
  GOOGLE_CLIENT: {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
  };
  JWT: {
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
  };
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVaribales = [
    "PORT",
    "MONGODB_URI",
    "MINIO_ENDPOINT",
    "MINIO_PORT",
    "MINIO_ACCESS_KEY",
    "MINIO_SECRET_KEY",
    "MINIO_BUCKET_NAME",
    "MINIO_USE_SSL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
  ];

  requiredEnvVaribales.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Environment variable ${key} is not set`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    MONGODB_URI: process.env.MONGODB_URI as string,
    MINIO: {
      MINIO_ENDPOINT: process.env.MINIO_ENDPOINT as string,
      MINIO_PORT: process.env.MINIO_PORT as string,
      MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY as string,
      MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY as string,
      MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME as string,
      MINIO_USE_SSL: process.env.MINIO_USE_SSL as string,
    },
    GOOGLE_CLIENT: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    },
    JWT: {
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    },
  };
};

export const envVars = loadEnvVariables();
