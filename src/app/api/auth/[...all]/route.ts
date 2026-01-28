import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const GET = async (request: Request) => {
  const { GET } = toNextJsHandler(getAuth());
  return GET(request);
};

export const POST = async (request: Request) => {
  const { POST } = toNextJsHandler(getAuth());
  return POST(request);
};
